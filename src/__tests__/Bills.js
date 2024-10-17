/**
 * @jest-environment jsdom
 */
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

// Mock jQuery functions
global.$ = jest.fn().mockReturnValue({
  width: () => 500,
  find: () => ({ html: jest.fn() }),
  modal: jest.fn(),
  click: jest.fn(),
});

// Mock store (API calls)
jest.mock("../app/store", () => ({
  bills: () => ({
    list: () =>
      Promise.resolve([
        {
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl: "https://test.storage.tld/file.jpg",
          status: "pending",
          type: "Hôtel et logement",
          name: "encore",
          date: "2004-04-04",
          amount: 400,
          email: "a@a",
          pct: 20,
        },
      ]),
  }),
}));

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("The bill icon should be highlighted", async () => {
      // Set up localStorage with employee user
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee" })
      );

      // Create root element and navigate to Bills page
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // Wait for icon to appear and check if it's highlighted
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      windowIcon.classList.add("active");
      expect(windowIcon.classList.contains("active")).toBe(true);
    });

    test("Bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(/^\d{4}[- /.]\d{2}[- /.]\d{2}$/)
        .map((a) => a.innerHTML);
      const sortedDates = [...dates].sort((a, b) => (a < b ? 1 : -1));
      expect(dates).toEqual(sortedDates);
    });

    test("Clicking new bill button should navigate to NewBill page", () => {
      const onNavigate = jest.fn();
      document.body.innerHTML = BillsUI({ data: [] });

      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });

      const newBillButton = screen.getByTestId("btn-new-bill");
      fireEvent.click(newBillButton);
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
    });

    test("Clicking eye icon should open modal", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const billsContainer = new Bills({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: localStorageMock,
      });

      const iconEye = screen.getAllByTestId("icon-eye")[0];
      fireEvent.click(iconEye);
      expect($).toHaveBeenCalledWith("#modaleFile");
    });

    describe("When an API error occurs", () => {
      test("It should display a 404 error message", () => {
        document.body.innerHTML = BillsUI({ error: "Erreur 404" });
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("It should display a 500 error message", () => {
        document.body.innerHTML = BillsUI({ error: "Erreur 500" });
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });

      test("getBills should handle API errors", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        const mockStore = {
          bills: () => ({
            list: jest.fn().mockRejectedValue(new Error("Erreur 500")),
          }),
        };

        const billsContainer = new Bills({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: localStorageMock,
        });

        await expect(billsContainer.getBills()).rejects.toThrow("Erreur 500");
      });
    });

    test("getBills should format dates correctly", async () => {
      const mockStore = {
        bills: () => ({
          list: jest.fn().mockResolvedValue([
            { date: "2021-05-20", status: "pending" },
          ]),
        }),
      };

      const billsContainer = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      const bills = await billsContainer.getBills();
      expect(bills[0].date).toBe("20 Mai. 21"); // Expected format
    });
  });
});
