import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PosLoginPage } from "./PosLoginPage";
import { usePosAuthStore } from "@/stores/posAuth.store";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("PosLoginPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePosAuthStore.setState({ staff: null });
  });

  it("renders POS branding, instant demo role buttons and visit website link", () => {
    render(
      <MemoryRouter>
        <PosLoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Saffron & Smoke")).toBeInTheDocument();
    expect(screen.getByText("Instant Demo Access")).toBeInTheDocument();
    expect(screen.getByText("Visit Website")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Executive")).toBeInTheDocument();
    expect(screen.getByText("Manager")).toBeInTheDocument();
    expect(screen.getByText("Captain")).toBeInTheDocument();
    expect(screen.getByText("Cashier")).toBeInTheDocument();
    expect(screen.getByText("Server / Waiter")).toBeInTheDocument();
  });

  it("has visit website button pointing to '/'", () => {
    render(
      <MemoryRouter>
        <PosLoginPage />
      </MemoryRouter>
    );

    const visitLink = screen.getByText("Visit Website").closest("a");
    expect(visitLink).not.toBeNull();
    expect(visitLink).toHaveAttribute("href", "/");
  });

  it("performs instant login when clicking an instant demo role card (Admin)", async () => {
    render(
      <MemoryRouter>
        <PosLoginPage />
      </MemoryRouter>
    );

    const adminButton = screen.getByText("Admin").closest("button");
    expect(adminButton).not.toBeNull();
    fireEvent.click(adminButton!);

    await waitFor(() => {
      expect(usePosAuthStore.getState().staff?.role).toBe("admin");
      expect(mockNavigate).toHaveBeenCalledWith("/pos/dashboard");
    });
  });

  it("performs instant login when clicking Cashier demo role card", async () => {
    render(
      <MemoryRouter>
        <PosLoginPage />
      </MemoryRouter>
    );

    const cashierButton = screen.getByText("Cashier").closest("button");
    expect(cashierButton).not.toBeNull();
    fireEvent.click(cashierButton!);

    await waitFor(() => {
      expect(usePosAuthStore.getState().staff?.role).toBe("cashier");
      expect(mockNavigate).toHaveBeenCalledWith("/pos/dashboard");
    });
  });

  it("allows typing PIN manually on numeric pad and submitting", async () => {
    render(
      <MemoryRouter>
        <PosLoginPage />
      </MemoryRouter>
    );

    // Click '1', '2', '3', '4' on numeric pad
    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("2"));
    fireEvent.click(screen.getByText("3"));
    fireEvent.click(screen.getByText("4"));

    const enterButton = screen.getByText(/Enter PIN/i);
    fireEvent.click(enterButton);

    await waitFor(() => {
      expect(usePosAuthStore.getState().staff?.role).toBe("manager");
      expect(mockNavigate).toHaveBeenCalledWith("/pos/dashboard");
    });
  });
});
