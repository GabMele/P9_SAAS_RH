/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import { ROUTES } from "../constants/routes"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  let newBill

  beforeEach(() => {
    document.body.innerHTML = NewBillUI()
    localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.com" }))
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    })
  })

  describe("When I upload a receipt image", () => {
    test("Then the image should be uploaded successfully", async () => {
      const file = new File(["image"], "receipt.jpg", { type: "image/jpeg" })
      const inputFile = screen.getByTestId("file")
      
      const uploadFileMock = jest.fn().mockResolvedValue({
        fileUrl: "http://localhost:3456/images/receipt.jpg",
        key: "1234"
      })
      
      const mockStore = {
        bills: () => ({
          create: uploadFileMock
        })
      }
      
      newBill.store = mockStore
      
      userEvent.upload(inputFile, file)
      
      await waitFor(() => {
        expect(uploadFileMock).toHaveBeenCalled()
        expect(newBill.fileUrl).toBe("http://localhost:3456/images/receipt.jpg")
        expect(newBill.billId).toBe("1234")
      })
    })

    test("Then it should handle file upload failure with 404", async () => {
      const file = new File(["image"], "receipt.jpg", { type: "image/jpeg" })
      const inputFile = screen.getByTestId("file")
      
      const consoleSpy = jest.spyOn(console, "error").mockImplementation()
      
      const uploadFileMock = jest.fn().mockRejectedValue(new Error("404 Not Found"))
      
      const mockStore = {
        bills: () => ({
          create: uploadFileMock
        })
      }
      
      newBill.store = mockStore
      
      userEvent.upload(inputFile, file)
      
      await waitFor(() => {
        expect(uploadFileMock).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(new Error("404 Not Found"))
      })
      
      consoleSpy.mockRestore()
    })

    test("Then it should handle file upload failure with 500", async () => {
      const file = new File(["image"], "receipt.jpg", { type: "image/jpeg" })
      const inputFile = screen.getByTestId("file")
      
      const consoleSpy = jest.spyOn(console, "error").mockImplementation()
      
      const uploadFileMock = jest.fn().mockRejectedValue(new Error("500 Internal Server Error"))
      
      const mockStore = {
        bills: () => ({
          create: uploadFileMock
        })
      }
      
      newBill.store = mockStore
      
      userEvent.upload(inputFile, file)
      
      await waitFor(() => {
        expect(uploadFileMock).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(new Error("500 Internal Server Error"))
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe("When I submit the new bill form", () => {
    test("Then the bill should be submitted successfully", async () => {
      const billData = {
        type: "Transports",
        name: "Train Ticket",
        amount: "100",
        date: "2023-09-01",
        vat: "10",
        pct: "20",
        commentary: "Business travel",
      }

      // Fill form
      screen.getByTestId("expense-type").value = billData.type
      screen.getByTestId("expense-name").value = billData.name
      screen.getByTestId("datepicker").value = billData.date
      screen.getByTestId("amount").value = billData.amount
      screen.getByTestId("vat").value = billData.vat
      screen.getByTestId("pct").value = billData.pct
      screen.getByTestId("commentary").value = billData.commentary

      const submitBillMock = jest.fn().mockResolvedValue({})
      const mockStore = {
        bills: () => ({
          update: submitBillMock // Note: API method name remains 'update' but we test bill submission
        })
      }
      newBill.store = mockStore
      newBill.fileUrl = "http://localhost:3456/images/receipt.jpg"
      newBill.fileName = "receipt.jpg"
      newBill.billId = "1234"

      const form = screen.getByTestId("form-new-bill")
      fireEvent.submit(form)

      await waitFor(() => {
        expect(submitBillMock).toHaveBeenCalled()
        expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      })
    })

    test("Then it should handle submission failure with 404", async () => {
      const billData = {
        type: "Transports",
        name: "Train Ticket",
        amount: "100",
        date: "2023-09-01",
        vat: "10",
        pct: "20",
        commentary: "Business travel",
      }

      // Fill form
      screen.getByTestId("expense-type").value = billData.type
      screen.getByTestId("expense-name").value = billData.name
      screen.getByTestId("datepicker").value = billData.date
      screen.getByTestId("amount").value = billData.amount
      screen.getByTestId("vat").value = billData.vat
      screen.getByTestId("pct").value = billData.pct
      screen.getByTestId("commentary").value = billData.commentary

      const consoleSpy = jest.spyOn(console, "error").mockImplementation()

      const submitBillMock = jest.fn().mockRejectedValue(new Error("404 Not Found"))
      const mockStore = {
        bills: () => ({
          update: submitBillMock
        })
      }
      newBill.store = mockStore
      newBill.fileUrl = "http://localhost:3456/images/receipt.jpg"
      newBill.fileName = "receipt.jpg"
      newBill.billId = "1234"

      const form = screen.getByTestId("form-new-bill")
      fireEvent.submit(form)

      await waitFor(() => {
        expect(submitBillMock).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(new Error("404 Not Found"))
      })

      consoleSpy.mockRestore()
    })

    test("Then it should handle submission failure with 500", async () => {
      const billData = {
        type: "Transports",
        name: "Train Ticket",
        amount: "100",
        date: "2023-09-01",
        vat: "10",
        pct: "20",
        commentary: "Business travel",
      }

      // Fill form
      screen.getByTestId("expense-type").value = billData.type
      screen.getByTestId("expense-name").value = billData.name
      screen.getByTestId("datepicker").value = billData.date
      screen.getByTestId("amount").value = billData.amount
      screen.getByTestId("vat").value = billData.vat
      screen.getByTestId("pct").value = billData.pct
      screen.getByTestId("commentary").value = billData.commentary

      const consoleSpy = jest.spyOn(console, "error").mockImplementation()

      const submitBillMock = jest.fn().mockRejectedValue(new Error("500 Internal Server Error"))
      const mockStore = {
        bills: () => ({
          update: submitBillMock
        })
      }
      newBill.store = mockStore
      newBill.fileUrl = "http://localhost:3456/images/receipt.jpg"
      newBill.fileName = "receipt.jpg"
      newBill.billId = "1234"

      const form = screen.getByTestId("form-new-bill")
      fireEvent.submit(form)

      await waitFor(() => {
        expect(submitBillMock).toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith(new Error("500 Internal Server Error"))
      })

      consoleSpy.mockRestore()
    })
  })
})