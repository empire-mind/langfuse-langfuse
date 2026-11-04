import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionManageViewsList } from "./SessionManageViewsList";

const defaultProps = {
  views: [
    { id: "one", name: "Generations" },
    { id: "two", name: "Errors" },
  ],
  unpinnedViewIds: ["two"],
  canEdit: true,
  isLoading: false,
  error: undefined,
  onPin: vi.fn(),
  onUnpin: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onMove: vi.fn(),
};

describe("SessionManageViewsList", () => {
  it("offers reordering without edit permission and disables boundary moves", () => {
    render(<SessionManageViewsList {...defaultProps} canEdit={false} />);
    expect(
      screen.getByRole("button", { name: "Move Generations up" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Move Errors down" }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Move Errors up" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Move Generations down" }),
    );
    expect(defaultProps.onMove).toHaveBeenCalledWith("two", "up");
    expect(defaultProps.onMove).toHaveBeenCalledWith("one", "down");
  });
  it("offers pinning, unpinning, editing, and deletion for saved views", () => {
    render(<SessionManageViewsList {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Unpin Generations" }));
    fireEvent.click(screen.getByRole("button", { name: "Pin Errors" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit Generations" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Errors" }));
    expect(defaultProps.onUnpin).toHaveBeenCalledWith("one");
    expect(defaultProps.onPin).toHaveBeenCalledWith("two");
    expect(defaultProps.onEdit).toHaveBeenCalledWith("one");
    expect(defaultProps.onDelete).toHaveBeenCalledWith("two");
  });

  it("keeps pinning available without edit permissions", () => {
    render(<SessionManageViewsList {...defaultProps} canEdit={false} />);
    expect(
      screen.getByRole("button", { name: "Pin Errors" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Edit/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Delete/ }),
    ).not.toBeInTheDocument();
  });

  it("explains when no saved views exist", () => {
    render(<SessionManageViewsList {...defaultProps} views={[]} />);
    expect(screen.getByText("No saved views yet.")).toBeInTheDocument();
  });
});
