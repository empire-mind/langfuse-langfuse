import { type ComponentProps } from "react";
import { Plus, Settings2, X } from "@langfuse/icons";
import { Tabs } from "@/src/components/design-system/Tabs/Tabs";
import { IconButton } from "@/src/components/design-system/IconButton/IconButton";
import { Tooltip } from "@/src/components/design-system/Tooltip/Tooltip";

export function TabBar({
  label,
  tabs,
  createAction,
  manageAction,
}: {
  label: string;
  tabs: (Pick<
    ComponentProps<typeof Tabs.Trigger>,
    "value" | "label" | "internal" | "disabled" | "tooltip" | "icon"
  > & {
    value: string;
    label: string;
    removeAction?: { label: string; onClick: () => void };
  })[];
  createAction?: { label: string; onClick: () => void };
  manageAction?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex shrink-0 items-center border-b px-2">
      <div className="min-w-0 overflow-x-auto">
        <Tabs.List variant="underline" aria-label={label}>
          {tabs.map(({ removeAction, ...tab }) => (
            <div
              key={tab.value}
              className="has-[[data-state=active]]:after:bg-foreground-secondary relative flex h-full shrink-0 items-center after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5"
            >
              <Tabs.Trigger {...tab} />
              {removeAction && (
                <div className="pr-2">
                  <Tooltip label={removeAction.label}>
                    {({ getTriggerProps }) => (
                      <IconButton
                        icon={X}
                        label={removeAction.label}
                        size="xs"
                        {...getTriggerProps({ onClick: removeAction.onClick })}
                      />
                    )}
                  </Tooltip>
                </div>
              )}
            </div>
          ))}
        </Tabs.List>
      </div>
      {createAction && (
        <Tooltip label={createAction.label}>
          {({ getTriggerProps }) => (
            <IconButton
              icon={Plus}
              label={createAction.label}
              size="sm"
              {...getTriggerProps({ onClick: createAction.onClick })}
            />
          )}
        </Tooltip>
      )}
      {manageAction && (
        <div className="flex flex-1 justify-end pl-2">
          <Tooltip label={manageAction.label}>
            {({ getTriggerProps }) => (
              <IconButton
                icon={Settings2}
                label={manageAction.label}
                size="sm"
                {...getTriggerProps({ onClick: manageAction.onClick })}
              />
            )}
          </Tooltip>
        </div>
      )}
    </div>
  );
}
