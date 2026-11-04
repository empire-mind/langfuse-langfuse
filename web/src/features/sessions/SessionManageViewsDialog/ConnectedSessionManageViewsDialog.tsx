import { useId, useState } from "react";
import {
  type FilterState,
  type TableViewPresetDomain,
  TableViewPresetTableName,
} from "@langfuse/shared";
import { api } from "@/src/utils/api";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { DialogController } from "@/src/components/design-system/DialogController/DialogController";
import { ConfirmationDialogController } from "@/src/components/design-system/ConfirmationDialogController/ConfirmationDialogController";
import { Input } from "@/src/components/design-system/Input/Input";
import { Form } from "@/src/components/design-system/Form/Form";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import {
  SessionFilterInput,
  useSessionFilterInput,
} from "@/src/features/sessions/SessionCustomizationDialog/components/SessionFilterInput/SessionFilterInput";
import { SessionManageViewsList } from "./SessionManageViewsList";

function ConnectedSessionViewEditor({
  projectId,
  view,
  isSaving,
  error,
  onSave,
}: {
  projectId: string;
  view: Pick<TableViewPresetDomain, "id" | "name" | "filters">;
  isSaving: boolean;
  error: string | undefined;
  onSave: (name: string, filters: FilterState) => void;
}) {
  const formId = useId();
  const [name, setName] = useState(view.name);
  const [filters, setFilters] = useState(view.filters);
  const filterInput = useSessionFilterInput({
    projectId,
    filters,
    onFiltersChange: setFilters,
  });
  return (
    <Dialog
      title="Edit view"
      actions={[
        {
          label: "Save changes",
          type: "submit",
          form: formId,
          loading: isSaving,
          disabled: !name.trim() || filterInput.invalid,
        },
      ]}
    >
      <Dialog.Body>
        <form
          id={formId}
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim() || isSaving) return;
            const nextFilters = filterInput.readFilters();
            if (nextFilters === null) return;
            onSave(name.trim(), nextFilters);
          }}
        >
          <Form.Field label="View name">
            {({ id }) => (
              <Input
                id={id}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
              />
            )}
          </Form.Field>
          <Form.Field label="Observation filters">
            {({ id }) => (
              <SessionFilterInput {...filterInput.inputProps} inputId={id} />
            )}
          </Form.Field>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
        </form>
      </Dialog.Body>
    </Dialog>
  );
}

export function ConnectedSessionManageViewsDialog({
  projectId,
  unpinnedViewIds,
  viewOrder,
  onReorder,
  onPin,
  onUnpin,
  onViewUpdated,
  onViewDeleted,
}: {
  projectId: string;
  unpinnedViewIds: string[];
  viewOrder: string[];
  onReorder: (ids: string[]) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onViewUpdated: (id: string, filters: FilterState) => void;
  onViewDeleted: (id: string) => void;
}) {
  const utils = api.useUtils();
  const views = api.TableViewPresets.getByTableName.useQuery({
    projectId,
    tableName: TableViewPresetTableName.SessionDetail,
  });
  const canEdit = useHasProjectAccess({
    projectId,
    scope: "TableViewPresets:CUD",
  });
  const updateView = api.TableViewPresets.update.useMutation({
    onSuccess: ({ view }) => {
      utils.TableViewPresets.getByTableName.invalidate();
      utils.TableViewPresets.getById.invalidate({ projectId, viewId: view.id });
      onViewUpdated(view.id, view.filters);
    },
  });
  const deleteView = api.TableViewPresets.delete.useMutation({
    onSuccess: (_, input) => {
      utils.TableViewPresets.getByTableName.invalidate();
      utils.TableViewPresets.getById.invalidate({
        projectId,
        viewId: input.tableViewPresetsId,
      });
      onViewDeleted(input.tableViewPresetsId);
    },
  });
  const customViews = (views.data?.filter((view) => !view.isSystem) ?? []).sort(
    (left, right) => {
      const leftIndex = viewOrder.indexOf(left.id);
      const rightIndex = viewOrder.indexOf(right.id);
      return (
        (leftIndex < 0 ? Infinity : leftIndex) -
        (rightIndex < 0 ? Infinity : rightIndex)
      );
    },
  );
  return (
    <Dialog title="Manage views" closeLabel="Done">
      <Dialog.Body>
        <DialogController<NonNullable<typeof views.data>[number]>
          onBeforeClose={() => !updateView.isPending}
          renderDialog={({ state: view, closeDialog }) => (
            <ConnectedSessionViewEditor
              projectId={projectId}
              view={view}
              isSaving={updateView.isPending}
              error={updateView.error?.message}
              onSave={(name, filters) =>
                updateView.mutate(
                  {
                    projectId,
                    id: view.id,
                    name,
                    filters,
                    tableName: TableViewPresetTableName.SessionDetail,
                    columnOrder: view.columnOrder,
                    columnVisibility: view.columnVisibility,
                    orderBy: view.orderBy,
                    searchQuery: view.searchQuery ?? undefined,
                  },
                  { onSuccess: closeDialog },
                )
              }
            />
          )}
        >
          {({ openDialog: openEditor }) => (
            <ConfirmationDialogController<
              NonNullable<typeof views.data>[number]
            >
              title={(view) => `Delete ${view.name}?`}
              text="This permanently deletes the saved view for everyone in this project."
              confirmLabel="Delete view"
              variant="destructive"
              loading={deleteView.isPending}
              error={deleteView.error?.message}
              onConfirm={async (view) => {
                await deleteView.mutateAsync({
                  projectId,
                  tableViewPresetsId: view.id,
                });
              }}
            >
              {({ openDialog: openDelete }) => (
                <SessionManageViewsList
                  views={customViews}
                  unpinnedViewIds={unpinnedViewIds}
                  canEdit={canEdit}
                  isLoading={views.isLoading}
                  error={views.error?.message}
                  onPin={onPin}
                  onUnpin={onUnpin}
                  onMove={(id, direction) => {
                    const ids = customViews.map((view) => view.id);
                    const index = ids.indexOf(id);
                    const target = direction === "up" ? index - 1 : index + 1;
                    if (index < 0 || target < 0 || target >= ids.length) return;
                    ids.splice(index, 1);
                    ids.splice(target, 0, id);
                    onReorder(ids);
                  }}
                  onEdit={(id) => {
                    const view = customViews.find((view) => view.id === id);
                    if (!view || !canEdit) return;
                    updateView.reset();
                    openEditor(view);
                  }}
                  onDelete={(id) => {
                    const view = customViews.find((view) => view.id === id);
                    if (!view || !canEdit) return;
                    deleteView.reset();
                    openDelete(view);
                  }}
                />
              )}
            </ConfirmationDialogController>
          )}
        </DialogController>
      </Dialog.Body>
    </Dialog>
  );
}
