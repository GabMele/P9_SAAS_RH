/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
    });

    test("Then bill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon.classList.contains('active-icon')).toBe(true);  // Assert 'active' class is added to highlight the icon
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("Then bills data should load properly", async () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const billsList = await waitFor(() => screen.getAllByTestId('bill'));
      expect(billsList.length).toBe(4);  // Assuming there are 4 bills in the mocked data
    });

    test("Then when the new bill button is clicked, it should navigate to the New Bill page", () => {
      const onNavigate = jest.fn();
      document.body.innerHTML = BillsUI({ data: [] });
      const bills = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });

      const buttonNewBill = screen.getByTestId('btn-new-bill');
      buttonNewBill.click();
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    });

    test("Then when the eye icon is clicked, the modal should open", () => {
      const bills = new Bills({ document, onNavigate: null, store: null, localStorage: window.localStorage });

      const iconEye = document.createElement('div');
      iconEye.setAttribute('data-testid', 'icon-eye');
      iconEye.setAttribute('data-bill-url', 'https://example.com/bill.jpg');
      document.body.append(iconEye);

      $.fn.modal = jest.fn();  // Mock Bootstrap modal function
      bills.handleClickIconEye(iconEye);

      expect($.fn.modal).toHaveBeenCalled();  // Modal should be triggered
    });

  });
});
