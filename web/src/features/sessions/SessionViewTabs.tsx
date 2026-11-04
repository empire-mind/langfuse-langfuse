import { Tabs } from "@/src/components/design-system/Tabs/Tabs";
import { TabBar } from "@/src/components/TabBar/TabBar";

export function SessionViewTabs({
  value,
  hasUnsavedView,
  savedViews,
  onManageViews,
  onUnpin,
  onRemoveUnsaved,
  onValueChange,
  onCreate,
}: {
  value: string;
  hasUnsavedView: boolean;
  savedViews: { id: string; name: string }[];
  onManageViews: () => void;
  onUnpin: (id: string) => void;
  onRemoveUnsaved: () => void;
  onValueChange: (value: string) => void;
  onCreate: () => void;
}) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabBar
        label="Session views"
        tabs={[
          { value: "messages", label: "Messages" },
          ...savedViews.map((view) => ({
            value: view.id,
            label: view.name,
            removeAction: {
              label: `Unpin ${view.name}`,
              onClick: () => onUnpin(view.id),
            },
          })),
          ...(hasUnsavedView
            ? [
                {
                  value: "unsaved",
                  label: "Unsaved view",
                  removeAction: {
                    label: "Remove unsaved view",
                    onClick: onRemoveUnsaved,
                  },
                },
              ]
            : []),
        ]}
        createAction={{ label: "Create custom view", onClick: onCreate }}
        manageAction={{ label: "Manage views", onClick: onManageViews }}
      />
    </Tabs>
  );
}
