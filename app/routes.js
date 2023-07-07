//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

router.get('/', (req, res) => {
	res.render("/prototype-home.html")
})

router.get('/reporting', (req, res) => {
	let Xaxis = ['"7am"', '"8am"', '"9am"', '"10am"', '"11am"', '"12pm"', '"1pm"', '"2pm"']
	let min = 5
	let max = 20
	let chartData = Xaxis.map(x => (Math.random() * (max - min)) + min)
	chartData = chartData.map(c => c*1.4)
	chartData = chartData.map(Math.floor)
	res.render("/reporting.html", {Xaxis, chartData})
})

const allGrades = ["heo", "grade-7", "grade-6"]
const allProfessions = ["finance", "ddat", "administritive"]

router.post('/reporting', (req, res) => {
	const dateRange = req.body['date-range']
	const includeSubdepartments = req.body['include-subdepartments']
	const mandatoryLearning = req.body['mandatory-learning']
	const flatGrades = [req.body['grade']].flat()
	const grades = {}
	allGrades.forEach(g => grades[g] = flatGrades.includes(g))
	const flatProfessions = [req.body['profession']].flat()
	const professions = {}
	allProfessions.forEach(p => professions[p] = flatProfessions.includes(p))

	const Xaxis = []
	let chartData = []
	let min = 5
	let max = 20

	if (dateRange === 'today') {
		Xaxis.push('"7am"', '"8am"', '"9am"', '"10am"', '"11am"', '"12pm"', '"1pm"', '"2pm"')
	} else if (dateRange == 'past-seven-days') {
		Xaxis.push('"Monday"', '"Tuesday"', '"Wednesday"', '"Thursday"', '"Friday"', '"Saturday"', '"Sunday"')
		min = 50
		max = 200
	} else if (dateRange == 'past-month') {
		min = 300
		max = 2000
		Xaxis.push('"1st - 8th Jul"', '"8th - 15th Jul"', '"15th - 22nd Jul"', '"22nd - 29th Jul"')
	} else if (dateRange == 'past-year') {
		min = 4000
		max = 20000
		Xaxis.push('"Jul"', '"Aug"', '"Sep"', '"Oct"', '"Nov"', '"Dec"', '"Jan"', '"Feb"', '"Mar"', '"Apr"', '"May"', '"Jun"')
	}
	chartData = Xaxis.map(x => (Math.random() * (max - min)) + min)

	if (includeSubdepartments !== "_unchecked") {
		chartData = chartData.map(c => c*1.4)
	}

	if (mandatoryLearning === "required-learning") {
		chartData = chartData.map(c => c*0.4)
	} else if (mandatoryLearning === "non-required-learning") {
		chartData = chartData.map(c => c*0.7)
	}
	const gradeVals = Object.values(grades)
	if (gradeVals.filter(g => g === false).length === 3 || gradeVals.filter(g => g !== false).length === 3) {
		chartData = chartData.map(c => c*1.4)
	} else {
		chartData = chartData.map(c => c*(1.4/gradeVals.length))
	}

	const profVals = Object.values(professions)
	if (profVals.filter(g => g === false).length === 3 || profVals.filter(g => g !== false).length === 3) {
		chartData = chartData.map(c => c*1.4)
	} else {
		chartData = chartData.map(c => c*(1.4/profVals.length))
	}

	chartData = chartData.map(Math.floor)
	
	res.render("/reporting.html", {Xaxis, chartData, dateRange,
		includeSubdepartments,
		mandatoryLearning,
		grades,
		professions})
})