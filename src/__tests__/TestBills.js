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
  width: () => 100,
  find: () => ({
    html: jest.fn(),
  }),
  modal: jest.fn(),
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon.classList.contains('active')).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    // Test for 404 error
    test("Then an error message should be displayed when 404 error occurs", () => {
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    // Test for 500 error
    test("Then an error message should be displayed when 500 error occurs", () => {
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });

    // Test loading state
    test("Then a loading message should be displayed during data fetching", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getByText(/Loading.../)).toBeTruthy();
    });
  });

  describe("When I click on New Bill button", () => {
    test("Then I should be redirected to NewBill page", () => {
      document.body.innerHTML = `<button data-testid="btn-new-bill"></button>`;
      const onNavigate = jest.fn();
      const bills = new Bills({ 
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      });

      const button = screen.getByTestId('btn-new-bill');
      fireEvent.click(button);

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    });
  });

  describe("When I click on eye icon", () => {
    test("Then a modal should open with bill image", () => {
      document.body.innerHTML = `<div data-testid="icon-eye" data-bill-url="fake-url"></div>`;
      const bills = new Bills({ 
        document,
        onNavigate: null,
        store: null,
        localStorage: window.localStorage
      });

      const eye = screen.getByTestId('icon-eye');
      fireEvent.click(eye);

      expect($.mock.calls.length).toBe(2);
      expect($.mock.calls[1][0]).toBe('#modaleFile');
    });
  });

  describe("When I navigate to Bills page", () => {
    test("Then getBills should fetch and format bills from store", async () => {
      const mockBills = [
        {
          id: 1,
          date: "2021-11-19",
          status: "pending"
        }
      ];

      const mockStore = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockResolvedValue(mockBills)
        })
      };

      const bills = new Bills({ 
        document,
        onNavigate: null,
        store: mockStore,
        localStorage: window.localStorage
      });

      const result = await bills.getBills();

      expect(mockStore.bills).toHaveBeenCalled();
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          status: "En attente"
        })
      ]));
    });

    test("Then getBills should handle corrupted date data", async () => {
      const mockBills = [
        {
          id: 1,
          date: "invalid-date",
          status: "pending"
        }
      ];

      const mockStore = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockResolvedValue(mockBills)
        })
      };

      const bills = new Bills({ 
        document,
        onNavigate: null,
        store: mockStore,
        localStorage: window.localStorage
      });

      const result = await bills.getBills();
      expect(result[0].date).toBe("invalid-date");
    });

    // Test for API call error handling
    describe("When an error occurs on API", () => {
      test("Then getBills should fail with 404 error", async () => {
        const mockStore = {
          bills: jest.fn().mockReturnValue({
            list: jest.fn().mockRejectedValue(new Error("Erreur 404"))
          })
        };

        const bills = new Bills({ 
          document,
          onNavigate: null,
          store: mockStore,
          localStorage: window.localStorage
        });

        // Wait for the promise to reject
        await expect(bills.getBills()).rejects.toThrow("Erreur 404");
      });

      test("Then getBills should fail with 500 error", async () => {
        const mockStore = {
          bills: jest.fn().mockReturnValue({
            list: jest.fn().mockRejectedValue(new Error("Erreur 500"))
          })
        };

        const bills = new Bills({ 
          document,
          onNavigate: null,
          store: mockStore,
          localStorage: window.localStorage
        });

        // Wait for the promise to reject
        await expect(bills.getBills()).rejects.toThrow("Erreur 500");
      });

      test("Then bills list should show error message", async () => {
        const mockStore = {
          bills: jest.fn().mockReturnValue({
            list: jest.fn().mockRejectedValue(new Error("Erreur 500"))
          })
        };

        // Render error UI
        document.body.innerHTML = BillsUI({ error: "Erreur 500" });
        
        const errorMessage = await screen.getByText(/Erreur 500/);
        expect(errorMessage).toBeTruthy();
      });
    });
  });
});