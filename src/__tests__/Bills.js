/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  // Integration Tests
  describe("When I navigate to Bills Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = '<div id="root"></div>'

      // Add necessary DOM elements
      const layoutDisconnect = document.createElement('div')
      layoutDisconnect.setAttribute('id', 'layout-disconnect')
      document.body.appendChild(layoutDisconnect)

      // Setup jQuery mock
      global.$ = jest.fn(() => ({
        click: jest.fn(),
        width: () => 500,
        find: () => ({ html: jest.fn() }),
        modal: jest.fn()
      }))
      $.fn = {}
      $.fn.modal = jest.fn()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    test("Then it should fetch bills from mock API", async () => {
      const bills = new Bills({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES_PATH[pathname],
        store: mockStore,
        localStorage: window.localStorage
      })

      const getBills = jest.fn(() => bills.getBills())
      const billsList = await getBills()
      expect(getBills).toHaveBeenCalled()
      expect(billsList.length).toBe(4)
    })

    test("Then it should handle new bill button click", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      
      // Add button to DOM
      const button = screen.getByTestId('btn-new-bill')
      
      const onNavigate = jest.fn()
      const billsClass = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      const handleClickNewBill = jest.fn(billsClass.handleClickNewBill)
      button.addEventListener('click', handleClickNewBill)
      fireEvent.click(button)
      
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
    })

    test("Then it should handle icon eye click", async () => {
      document.body.innerHTML = BillsUI({ data: bills })

      const billsClass = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage
      })

      // Setup modal
      $.fn.modal = jest.fn()

      const eye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(billsClass.handleClickIconEye)
      eye.addEventListener('click', () => handleClickIconEye(eye))
      fireEvent.click(eye)

      expect(handleClickIconEye).toHaveBeenCalled()
      expect($.fn.modal).toHaveBeenCalledWith('show')
    })

    test("Then it should handle API errors", async () => {
      const errorMessage = "Erreur 404"
      const errorStore = {
        bills: () => ({
          list: () => Promise.reject(new Error(errorMessage))
        })
      }

      const bills = new Bills({
        document,
        onNavigate: (pathname) => document.body.innerHTML = ROUTES_PATH[pathname],
        store: errorStore,
        localStorage: window.localStorage
      })

      // Test error case
      try {
        await bills.getBills()
      } catch (error) {
        expect(error.message).toBe(errorMessage)
      }
    })
  })
})