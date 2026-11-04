import { type TableViewPresetDomain } from "@langfuse/shared";
import {
  ArrowUp,
  ArrowDown,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from "@langfuse/icons";
import { IconButton } from "@/src/components/design-system/IconButton/IconButton";
import { Tooltip } from "@/src/components/design-system/Tooltip/Tooltip";

export function SessionManageViewsList({
  views,
  unpinnedViewIds,
  canEdit,
  isLoading,
  error,
  onPin,
  onUnpin,
  onEdit,
  onDelete,
  onMove,
}: {
  views: Pick<TableViewPresetDomain, "id" | "name">[];
  unpinnedViewIds: string[];
  canEdit: boolean;
  isLoading: boolean;
  error: string | undefined;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {isLoading && (
        <p className="text-muted-foreground text-sm">Loading saved views…</p>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      {!isLoading && !error && views.length === 0 && (
        <p className="text-muted-foreground text-sm">No saved views yet.</p>
      )}
      <ul className="divide-y">
        {views.map((view, index) => {
          const isPinned = !unpinnedViewIds.includes(view.id);
          const pinLabel = `${isPinned ? "Unpin" : "Pin"} ${view.name}`;
          return (
            <li key={view.id} className="flex items-center gap-2 py-2">
              <span
                className="min-w-0 flex-1 truncate text-sm"
                title={view.name}
              >
                {view.name}
              </span>
              <Tooltip label={`Move ${view.name} up`}>
                {({ getTriggerProps }) => (
                  <IconButton
                    icon={ArrowUp}
                    label={`Move ${view.name} up`}
                    disabled={index === 0}
                    {...getTriggerProps({
                      onClick: () => onMove(view.id, "up"),
                    })}
                  />
                )}
              </Tooltip>
              <Tooltip label={`Move ${view.name} down`}>
                {({ getTriggerProps }) => (
                  <IconButton
                    icon={ArrowDown}
                    label={`Move ${view.name} down`}
                    disabled={index === views.length - 1}
                    {...getTriggerProps({
                      onClick: () => onMove(view.id, "down"),
                    })}
                  />
                )}
              </Tooltip>
              <Tooltip label={pinLabel}>
                {({ getTriggerProps }) => (
                  <IconButton
                    icon={isPinned ? PinOff : Pin}
                    label={pinLabel}
                    {...getTriggerProps({
                      onClick: () =>
                        isPinned ? onUnpin(view.id) : onPin(view.id),
                    })}
                  />
                )}
              </Tooltip>
              {canEdit && (
                <>
                  <Tooltip label={`Edit ${view.name}`}>
                    {({ getTriggerProps }) => (
                      <IconButton
                        icon={Pencil}
                        label={`Edit ${view.name}`}
                        {...getTriggerProps({ onClick: () => onEdit(view.id) })}
                      />
                    )}
                  </Tooltip>
                  <Tooltip label={`Delete ${view.name}`}>
                    {({ getTriggerProps }) => (
                      <IconButton
                        icon={Trash2}
                        label={`Delete ${view.name}`}
                        {...getTriggerProps({
                          onClick: () => onDelete(view.id),
                        })}
                      />
                    )}
                  </Tooltip>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
