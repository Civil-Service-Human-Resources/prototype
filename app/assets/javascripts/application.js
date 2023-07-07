//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
  // Add JavaScript here
    let elements = document.querySelectorAll('.app-c-expander')
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i]
        new window.GOVUKPrototypeKit.Modules.Expander(element).init()
    }
})
