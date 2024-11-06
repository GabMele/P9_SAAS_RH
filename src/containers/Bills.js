// ./src/containers/Bills.js

import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then(snapshot => {
          console.log('Fetched snapshot:', snapshot); // Log the snapshot to see what is being returned
          const bills = snapshot
            .map(doc => {
              try {
                return {
                  ...doc,
                  date: doc.date, // Keep the raw date for sorting
                  formattedDate: formatDate(doc.date), // Format the date for display purposes
                  status: formatStatus(doc.status)
                }
              } catch(e) {
                console.error('Error formatting date for:', doc, e);
                return {
                  ...doc,
                  date: doc.date, // Keep the raw date in case of formatting errors
                  formattedDate: doc.date,
                  status: formatStatus(doc.status)
                }
              }
            });
    
          console.log('Dates before sorting:', bills.map(bill => bill.date));
  
          // Sort by the original date in descending order
          const sortedBills = bills.sort((a, b) => new Date(b.date) - new Date(a.date));
  
          // Replace `date` with `formattedDate` for display after sorting
          sortedBills.forEach(bill => bill.date = bill.formattedDate);
  
          return sortedBills;
        });
    }
  };
  
  
  
  
  
  
}
