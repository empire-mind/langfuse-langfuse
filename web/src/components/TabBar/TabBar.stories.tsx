import { expect, fn, userEvent, within } from "storybook/test";
import preview from "../../../.storybook/preview";
import { Tabs } from "@/src/components/design-system/Tabs/Tabs";
import { TabBar } from "./TabBar";

const meta = preview.meta({
  component: TabBar,
  decorators: [
    (Story) => (
      <Tabs defaultValue="messages">
        <Story />
      </Tabs>
    ),
  ],
});

export const Default = meta.story({
  name: "(Test) View actions",
  args: {
    label: "Views",
    tabs: [
      { value: "messages", label: "Messages" },
      {
        value: "generations",
        label: "Generations",
        removeAction: { label: "Unpin Generations", onClick: fn() },
      },
      {
        value: "unsaved",
        label: "Unsaved view",
        removeAction: { label: "Remove unsaved view", onClick: fn() },
      },
    ],
    createAction: { label: "Create custom view", onClick: fn() },
    manageAction: { label: "Manage views", onClick: fn() },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole("tab").map((tab) => tab.textContent),
    ).toEqual(["Messages", "Generations", "Unsaved view"]);
    await userEvent.click(
      canvas.getByRole("button", { name: "Unpin Generations" }),
    );
    await expect(args.tabs[1]?.removeAction?.onClick).toHaveBeenCalledOnce();
    await expect(canvas.getByRole("tab", { name: "Messages" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Remove unsaved view" }),
    );
    await expect(args.tabs[2]?.removeAction?.onClick).toHaveBeenCalledOnce();
    await userEvent.click(
      canvas.getByRole("button", { name: "Create custom view" }),
    );
    await expect(args.createAction?.onClick).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Manage views" }));
    await expect(args.manageAction?.onClick).toHaveBeenCalledOnce();
  },
});

export const TraceViews = meta.story({
  name: "(Test) Trace selection",
  args: {
    label: "Trace views",
    tabs: [
      { value: "trace", label: "Trace" },
      { value: "messages", label: "Messages", internal: true },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("tablist", { name: "Trace views" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("tab", { name: "Trace" }));
    await expect(canvas.getByRole("tab", { name: "Trace" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.click(canvas.getByRole("tab", { name: /Messages/ }));
    await expect(canvas.getByRole("tab", { name: /Messages/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
});
