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

	const datePickers = document.getElementsByClassName('ds_datepicker')
	for (let i = 0; i < datePickers.length; i++) {
		const dp = datePickers[i]
		const datePicker = new window.DS.components.DSDatePicker(
			dp,
			{
				dateSelectCallback: function (date) {
					console.log(`the selected date is ${date}`);
				},
				disabledDates: [
					new Date(2023, 4, 12),
					new Date(2023, 4, 13)
				],
				imagePath: '/public/images/',
				maxDate: new Date(),
				minDate: new Date(2019, 1, 1)
			}
		);
		
		datePicker.init();
		
	}

		// header navigation toggle
		if (document.querySelectorAll && document.addEventListener) {
			var els = document.querySelectorAll('.js-header-toggle'),
				i,
				_i
			for (i = 0, _i = els.length; i < _i; i++) {
				els[i].addEventListener('click', function(e) {
					e.preventDefault()
					var target = document.getElementById(
							this.getAttribute('href').substr(1)
						),
						targetClass = target.getAttribute('class') || '',
						sourceClass = this.getAttribute('class') || ''
	
					if (targetClass.indexOf('js-visible') !== -1) {
						target.setAttribute(
							'class',
							targetClass.replace(/(^|\s)js-visible(\s|$)/, ''),
							(document.getElementById('visiblyHidden').innerHTML = 'Select to expand')
						)
					} else {
						target.setAttribute('class', targetClass + ' js-visible')
						document.getElementById('visiblyHidden').innerHTML = 'Select to close'
					}
					if (sourceClass.indexOf('js-hidden') !== -1) {
						this.setAttribute(
							'class',
							sourceClass.replace(/(^|\s)js-hidden(\s|$)/, '')
						)
					} else {
						this.setAttribute('class', sourceClass + ' js-hidden')
					}
				})
			}
		}
	

})
