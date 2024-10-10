/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    let onNavigate;
    let store;
    let newBill;

    beforeEach(() => {
      localStorage.setItem("user", JSON.stringify({ email: "employee@example.com" }));
      
      const html = NewBillUI();
      document.body.innerHTML = html;

      onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = `<div>${pathname}</div>`;
      });

      store = {
        bills: () => ({
          create: jest.fn().mockResolvedValue({ fileUrl: "https://localhost:3456/images/test.jpg", key: "1234" }),
          update: jest.fn().mockResolvedValue({ id: "123" })
        })
      };

      newBill = new NewBill({ document, onNavigate, store, localStorage });
    });

    describe("When I am on NewBill Page", () => {
      test("Then bill form should be displayed", () => {
        expect(screen.getByText(/Envoyer une note de frais/i)).toBeInTheDocument();
        expect(screen.getByTestId("form-new-bill")).toBeInTheDocument();
      });

      describe("When I fill in the form fields", () => {
        test("Then I can select an expense type", () => {
          const expenseTypeSelect = screen.getByTestId("expense-type");
          fireEvent.change(expenseTypeSelect, { target: { value: "Restaurants et bars" } });
          expect(expenseTypeSelect.value).toBe("Restaurants et bars");
        });

        test("Then I can fill in the expense name", () => {
          const expenseNameInput = screen.getByTestId("expense-name");
          fireEvent.input(expenseNameInput, { target: { value: "Dinner" } });
          expect(expenseNameInput.value).toBe("Dinner");
        });

        test("Then I can fill in the date", () => {
          const dateInput = screen.getByTestId("datepicker");
          fireEvent.input(dateInput, { target: { value: "2024-10-03" } });
          expect(dateInput.value).toBe("2024-10-03");
        });

        test("Then I can fill in the amount", () => {
          const amountInput = screen.getByTestId("amount");
          fireEvent.input(amountInput, { target: { value: "100" } });
          expect(amountInput.value).toBe("100");
        });

        test("Then I can fill in the VAT", () => {
          const vatInput = screen.getByTestId("vat");
          fireEvent.input(vatInput, { target: { value: "20" } });
          expect(vatInput.value).toBe("20");
        });

        test("Then I can fill in the percentage", () => {
          const pctInput = screen.getByTestId("pct");
          fireEvent.input(pctInput, { target: { value: "20" } });
          expect(pctInput.value).toBe("20");
        });

        test("Then I can fill in a commentary", () => {
          const commentaryTextarea = screen.getByTestId("commentary");
          fireEvent.input(commentaryTextarea, { target: { value: "Business dinner" } });
          expect(commentaryTextarea.value).toBe("Business dinner");
        });
      });

      describe("When I upload a file", () => {
        test("Then it should accept a valid file format", async () => {
          const mockedStore = {
            bills: () => ({
              create: jest.fn().mockResolvedValue({ fileUrl: "https://localhost:3456/images/test.jpg", key: "1234" })
            })
          };

          const newBillWithMockedStore = new NewBill({ 
            document, 
            onNavigate, 
            store: mockedStore, 
            localStorage 
          });

          const handleChangeFile = jest.fn((e) => newBillWithMockedStore.handleChangeFile(e));
          
          const fileInput = screen.getByTestId("file");
          fileInput.addEventListener("change", handleChangeFile);
          
          const file = new File(["dummy content"], "photo.png", { type: "image/png" });
          fireEvent.change(fileInput, { target: { files: [file] } });
          
          await waitFor(() => {
            expect(handleChangeFile).toHaveBeenCalled();
            expect(fileInput.files[0].name).toBe("photo.png");
          });
        });

        test("Then it should reject an invalid file format", async () => {
          window.alert = jest.fn();
          
          const fileInput = screen.getByTestId("file");
          const invalidFile = new File(["dummy content"], "document.txt", { type: "text/plain" });
          
          fireEvent.change(fileInput, { target: { files: [invalidFile] } });
          
          expect(window.alert).toHaveBeenCalledWith("Veuillez sélectionner un fichier au format jpg, jpeg ou png.");
        });
      });

      describe("When I submit the form", () => {
        test("Then it should create a new bill and navigate to Bills page", async () => {
          const mockedStore = {
            bills: () => ({
              create: jest.fn().mockResolvedValue({ fileUrl: "https://localhost:3456/images/test.jpg", key: "1234" }),
              update: jest.fn().mockResolvedValue({ id: "123" })
            })
          };

          const newBillWithMockedStore = new NewBill({ 
            document, 
            onNavigate, 
            store: mockedStore, 
            localStorage 
          });

          // Fill form
          fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Restaurants et bars" } });
          fireEvent.input(screen.getByTestId("expense-name"), { target: { value: "Dinner" } });
          fireEvent.input(screen.getByTestId("datepicker"), { target: { value: "2024-10-03" } });
          fireEvent.input(screen.getByTestId("amount"), { target: { value: "100" } });
          fireEvent.input(screen.getByTestId("vat"), { target: { value: "20" } });
          fireEvent.input(screen.getByTestId("pct"), { target: { value: "20" } });
          fireEvent.input(screen.getByTestId("commentary"), { target: { value: "Business dinner" } });

          const fileInput = screen.getByTestId('file');
          const file = new File(["dummy content"], "photo.png", { type: "image/png" });
          
          const handleChangeFile = jest.fn((e) => newBillWithMockedStore.handleChangeFile(e));
          fileInput.addEventListener("change", handleChangeFile);
          
          fireEvent.change(fileInput, { target: { files: [file] } });
          
          await waitFor(() => {
            expect(handleChangeFile).toHaveBeenCalled();
          });

          const form = screen.getByTestId('form-new-bill');
          fireEvent.submit(form);

          await waitFor(() => {
            expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
          });
        });

        test("Then it should handle API errors gracefully", async () => {
          const errorMessage = "Error uploading file";
          const mockedStore = {
            bills: () => ({
              create: jest.fn().mockRejectedValue(new Error(errorMessage))
            })
          };

          const newBillWithMockedStore = new NewBill({ 
            document, 
            onNavigate, 
            store: mockedStore, 
            localStorage 
          });

          console.error = jest.fn();

          const fileInput = screen.getByTestId('file');
          const file = new File(["dummy content"], "photo.png", { type: "image/png" });
          
          const handleChangeFile = jest.fn((e) => newBillWithMockedStore.handleChangeFile(e));
          fileInput.addEventListener("change", handleChangeFile);
          
          fireEvent.change(fileInput, { target: { files: [file] } });

          await waitFor(() => {
            expect(console.error).toHaveBeenCalled();
            expect(onNavigate).not.toHaveBeenCalledWith(ROUTES_PATH['Bills']);
          });
        });
      });
    });
  });
});