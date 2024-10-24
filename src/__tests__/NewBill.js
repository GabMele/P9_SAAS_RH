/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  let newBill

  beforeEach(() => {
    document.body.innerHTML = NewBillUI()
    localStorage.setItem("user", JSON.stringify({ type: "Employee" }))
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

  describe("When I am on NewBill Page", () => {
    test("Then the form should be displayed", () => {
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })
  })

  describe("When I upload a file with a valid format (jpg, jpeg, png)", () => {
    test("Then the file input should accept the file", async () => {
      const file = new File(["image"], "test.jpg", { type: "image/jpeg" })
      const inputFile = screen.getByTestId("file")
      userEvent.upload(inputFile, file)

      await waitFor(() => expect(inputFile.files[0].name).toBe("test.jpg"))
    })
  })

  describe("When I upload a file with an invalid format", () => {
    test("Then the file input should reject the file", () => {
      const file = new File(["text"], "test.txt", { type: "text/plain" })
      const inputFile = screen.getByTestId("file")
      userEvent.upload(inputFile, file)

      expect(inputFile.value).toBe("")
    })
  })

  describe("When I submit the form with valid data", () => {
    test("Then the bill should be created and I should be redirected to the bills page", async () => {
      const inputData = {
        type: "Transports",
        name: "Train Ticket",
        amount: "100",
        date: "2023-09-01",
        vat: "10",
        pct: "20",
        commentary: "Business travel",
        fileUrl: "test.jpg",
        fileName: "test.jpg",
      }

      screen.getByTestId("expense-type").value = inputData.type
      screen.getByTestId("expense-name").value = inputData.name
      screen.getByTestId("datepicker").value = inputData.date
      screen.getByTestId("amount").value = inputData.amount
      screen.getByTestId("vat").value = inputData.vat
      screen.getByTestId("pct").value = inputData.pct
      screen.getByTestId("commentary").value = inputData.commentary

      const submitButton = screen.getByTestId("form-new-bill")
      fireEvent.submit(submitButton)

      await waitFor(() => expect(screen.getByText("Mes notes de frais")).toBeTruthy())
    })
  })

  describe("When I submit the form with missing data", () => {
    test("Then the form should not be submitted and I should stay on NewBill page", () => {
      const inputData = {
        type: "",
        name: "",
      }

      screen.getByTestId("expense-type").value = inputData.type
      screen.getByTestId("expense-name").value = inputData.name

      const submitButton = screen.getByTestId("form-new-bill")
      fireEvent.submit(submitButton)

      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })
  })
})
