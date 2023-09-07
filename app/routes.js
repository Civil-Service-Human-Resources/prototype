//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const dayjs = require('dayjs')
const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

class Tag {
	constructor(tagText, preText, dismissable, formName, formValue) {
		this.tagText = tagText
		this.preText = preText
		this.dismissable = dismissable
		this.formName = formName
		this.formValue = formValue
	}
}

class TagPanel {
	constructor(tags, parentForm, parentFormValue) {
		this.tags = tags
		this.parentForm = parentForm
		this.parentFormValue = parentFormValue
	}
}

const courses = {
	1: {
		"id": 1,
		"required": true,
		"name": "Counter fraud, bribery and corruption: all staff" 
	},
	2: {
		"id": 2,
		"required": true,
		"name": "Health and Safety" 
	},
	3: {
		"id": 3,
		"required": true,
		"name": "Security and Data Protection" 
	},
	4: {
		"id": 4,
		"required": true,
		"name": "Risk management" 
	},
	7: {
		"id": 7,
		"required": false,
		"name": "An introduction to the European Union" 
	},
	6: {
		"id": 6,
		"required": false,
		"name": "Civil Service Expectations" 
	},
	5: {
		"id": 5,
		"required": false,
		"name": "Success Profiles sifting and interviewing (blended)" 
	},
	8: {
		"id": 8,
		"required": false,
		"name": "Understanding and using business cases" 
	}
}

const mandatoryLearningMap = {
	"required-learning": "Required Learning",
	"non-required-learning": "Non-required Learning"
}

const allGrades = {
	"administrative-assistant": "Administrative assistant",
	"administrative-officer": "Administrative officer",
	"executive-officer": "Executive officer",
	"grade-6": "Grade 6",
	"grade-7": "Grade 7",
	"higher-executive-officer": "Higher executive officer",
	"scs-deputy-director": "SCS: deputy director",
	"scs-director": "SCS: director",
	"scs-director-general": "SCS: director general",
	"scs-permanent-secretary": "SCS: permanent secretary",
	"senior-executive-officer": "Senior executive officer"
}

const allProfessions = {
	"analysis": "Analysis",
	"commercial": "Commercial",
	"communications": "Communications",
	"corporate-finance": "Corporate finance",
	"counter-fraud": "Counter fraud",
	"digital-data-and-technology": "Digital, data and technology",
	"economics": "Economics",
	"finance": "Finance",
	"fraud-error-debts-and-grants": "Fraud, error, debts and grants",
	"human-resources": "Human resources",
	"intelligence-analysis": "Intelligence analysis",
	"internal-audit": "Internal audit",
	"international-trade": "International trade",
	"knowledge-and-information-management": "Knowledge and information management",
	"legal": "Legal",
	"medical": "Medical",
	"occupational-psychology": "Occupational psychology",
	"operational-delivery": "Operational delivery",
	"operational-research": "Operational research",
	"planning": "Planning",
	"planning-inspection": "Planning inspection",
	"policy": "Policy",
	"project-delivery": "Project delivery",
	"property": "Property",
	"science-and-engineering": "Science and engineering",
	"security": "Security",
	"social-research": "Social research",
	"statistics": "Statistics",
	"tax": "Tax",
	"veterinary": "Veterinary"
}

router.use((req, res, next) => {
	if (req.query.admin) {
		res.locals.admin = true
	}
	next()
})

router.get('/', (req, res) => {
	res.render("/prototype-home.html")
})

router.get('/reporting/completed-learning/select-organisation', (req, res) => {
	res.render("/select-organisation.html")
})

// Course report

router.get('/reporting/completed-learning/choose-courses', (req, res) => {
	const required = Object.values(courses)
	.filter(c => c.required == true)
	.map(c => {
		return {
			value: c.id,
			text: c.name,
			checked: false
		}
	})
	const nonRequired = Object.values(courses)
	.filter(c => c.required == false)
	.map(c => {
		return {
			value: c.id,
			text: c.name,
			checked: false
		}
	})
	res.render("/course-report/choose-courses.html", {required, nonRequired})
})

router.post('/reporting/completed-learning', (req, res) => {
	let learning = req.body['learning']
	let selectedCourses = [req.body[learning]].flat().filter(c => c !== undefined).filter(c => c !== '_unchecked')
	const dateRange = req.body['date-range']
	const startDate = req.body['start_date']
	const endDate = req.body['end_date']
	const remove = req.query['remove']
	let removeFormName
	let removeFormValue
	if (remove) {
		const split = remove.split(",")
		removeFormName = split[0]
		removeFormValue = split[1]
	}

	let includeSubdepartments = req.body['include-subdepartments']
	if (removeFormName == 'include-subdepartments' && removeFormValue == 'include-subdepts') {
		includeSubdepartments = "_unchecked"
	}
	
	let mandatoryLearning = [req.body['mandatory-learning']].flat().filter(g => g !== undefined)
	if (removeFormName == 'mandatory-learning') {
		mandatoryLearning = mandatoryLearning.filter(m => m !== removeFormValue)
	}

	if ((removeFormName || '').includes("learning")) {
		selectedCourses = selectedCourses.filter(c => c !== removeFormValue)
	}
	
	const mandatoryLearnings = {}
	Object.keys(mandatoryLearningMap).forEach(mL => mandatoryLearnings[mL] = mandatoryLearning.includes(mL))

	let flatGrades = [req.body['grade']].flat().filter(g => g !== undefined)
	if (removeFormName == 'grade') {
		flatGrades = flatGrades.filter(m => m !== removeFormValue)
	}
	const grades = {}
	Object.keys(allGrades).forEach(g => grades[g] = flatGrades.includes(g))

	let flatProfessions = [req.body['profession']].flat().filter(g => g !== undefined)
	if (removeFormName == 'profession') {
		flatProfessions = flatProfessions.filter(m => m !== removeFormValue)
	}
	const professions = {}
	Object.keys(allProfessions).forEach(p => professions[p] = flatProfessions.includes(p))

	let axisAndData
	let ticksConf
	let tooltipFormat
	let XaxisUnit
	let Xaxis = []
	let chartData = []
	let chartHeading = "Time"
	let baseMin = 10
	let baseMax = 40

	const dateTagPanel = new TagPanel([])

	if (dateRange === 'today' || dateRange === undefined) {
		tooltipFormat = "haaa"
		ticksConf = {span: 1, metric: 'hour'}
		axisAndData = getAxisAndData(selectedCourses, "hA", baseMin, baseMax, ticksConf, {span: 1, metric: 'hour'}, dayjs().set('hour', 0).set('minute', 0).set('second', 0), dayjs())
		dateTagPanel.tags.push(new Tag('Today', null, false, "date-range", "today"))
	} else if (dateRange == 'past-seven-days') {
		// Ticks: 1 day
		// Data: every 1 day
		tooltipFormat = "eeee d MMMM"
		ticksConf = {span: 1, metric: 'day'}
		axisAndData = getAxisAndData(selectedCourses, "D MMM", baseMin, baseMax, ticksConf, {span: 1, metric: 'day'}, dayjs().set('hour', 0).set('minute', 0).set('second', 0).subtract(7, 'day'), dayjs())
		chartHeading = "Day"
		dateTagPanel.tags.push(new Tag('Past seven days', null, false, "date-range", "past-seven-days"))
	} else if (dateRange == 'past-month') {
		// Ticks: 3 days
		// Data: every week
		tooltipFormat = "d MMMM yyyy"
		ticksConf = {span: 3, metric: 'day'}
		axisAndData = getAxisAndData(selectedCourses, "D MMM YYYY", baseMin*5, baseMax*5, ticksConf, {span: 1, metric: 'day'}, dayjs().set('hour', 0).set('minute', 0).set('second', 0).subtract(1, 'month'), dayjs())
		chartHeading = "Week"
		dateTagPanel.tags.push(new Tag('Past month', null, false, "date-range", "past-month"))
	} else if (dateRange == 'past-year') {
		// Ticks: 1 month
		// Data: every week
		tooltipFormat = "d MMMM yyyy"
		ticksConf = {span: 1, metric: 'month'}
		axisAndData = getAxisAndData(selectedCourses, tooltipFormat, baseMin*5, baseMax*5, ticksConf, {span: 2, metric: 'week'}, dayjs().set('hour', 0).set('minute', 0).set('second', 0).subtract(1, 'year'), dayjs())
		chartHeading = "Month"
		dateTagPanel.tags.push(new Tag('Past year', null, false, "date-range", "past-year"))
	} else if (dateRange == 'custom') {
		let from = startDate.split("/")
		let to = endDate.split("/")
		let customFrom = dayjs(from[1] + "/" + from[0] + "/" + from[2]).set('hour', 0).set('minute', 0).set('second', 0)
		let customTo = dayjs(to[1] + "/" + to[0] + "/" + to[2])
		dateTagPanel.tags.push(new Tag(customFrom.format('D MMMM YYYY'), "between", false, "start_date", from))
		dateTagPanel.tags.push(new Tag(customTo.format('D MMMM YYYY'), "and", false, "end_date", to))

		const dayDiff = customTo.diff(customFrom, 'days')
		if (dayDiff == 1) {
			tooltipFormat = "haaa"
			ticksConf = {span: 1, metric: 'hour'}
			axisAndData = getAxisAndData(selectedCourses, tooltipFormat, 5, 20, ticksConf, {span: 1, metric: 'hour'}, customFrom, customTo)
		} else if (dayDiff > 1 && dayDiff < 7) {
			tooltipFormat = "eeee d MMMM"
			ticksConf = {span: 1, metric: 'day'}
			axisAndData = getAxisAndData(selectedCourses, tooltipFormat, 50, 200, ticksConf, {span: 1, metric: 'day'}, customFrom, customTo)
			chartHeading = "Day"
		} else if (dayDiff > 7 && dayDiff < 30) {
			tooltipFormat = "eeee d MMMM"
			ticksConf = {span: 3, metric: 'day'}
			axisAndData = getAxisAndData(selectedCourses, tooltipFormat, 300, 2000, ticksConf, {span: 7, metric: 'day'}, customFrom, customTo)
			chartHeading = "Week"
		} else if (dayDiff > 30 && dayDiff < 180) {
			tooltipFormat = "d MMMM yyyy"
			ticksConf = {span: 7, metric: 'day'}
			axisAndData = getAxisAndData(selectedCourses, tooltipFormat, 300, 2000, ticksConf, {span: 7, metric: 'day'}, customFrom, customTo)
			chartHeading = "Month"
		} else if (dayDiff > 180) {
			tooltipFormat = "d MMMM yyyy"
			ticksConf = {span: 1, metric: 'month'}
			axisAndData = getAxisAndData(selectedCourses, tooltipFormat, 400, 20000, ticksConf, {span: 2, metric: 'week'}, customFrom, customTo)
			chartHeading = "Month"
		}
	}
	// chartData = Xaxis.map(x => (Math.random() * (max - min)) + min)

	chartData = axisAndData.chartData
	Xaxis = axisAndData.Xaxis
	XaxisUnit = ticksConf.metric
	let chartRows = axisAndData.chartRows

	const gradePanel = new TagPanel([])
	for (let i = 0; i < flatGrades.length; i++) {
		const gradeVal = flatGrades[i];
		if (gradeVal !== '_unchecked') {
			if (i===0) {
				gradePanel.tags.push(new Tag(allGrades[gradeVal], null, true, "grade", gradeVal))
			} else {
				gradePanel.tags.push(new Tag(allGrades[gradeVal], "and", true, "grade", gradeVal))
			}
		}
	}
	const profPanel = new TagPanel([])
	for (let i = 0; i < flatProfessions.length; i++) {
		const profVal = flatProfessions[i];
		if (profVal !== '_unchecked') {
			if (i===0) {
				profPanel.tags.push(new Tag(allProfessions[profVal], null, true, "profession", profVal))
			} else {
				profPanel.tags.push(new Tag(allProfessions[profVal], "and", true, "profession", profVal))
			}
		}
	}
	const reportingOnPanel = getReportingOnPanel(mandatoryLearning, "Cabinet Office", includeSubdepartments)

	const chartHeadings = [{
		"text": "Time range",
		"classes": "govuk-!-width-one-quarter"
	}]

	console.log(selectedCourses)

	const coursePanel = new TagPanel([], 'learning')
	for (let i = 0; i < selectedCourses.length; i++) {
		const courseId = selectedCourses[i]
		if (courseId !== '_unchecked') {
			const course = courses[courseId]
			const preText = i > 0 ? 'and' : null
			const type = course.required ? 'required-learning' : 'non-required-learning'
			chartHeadings.push({
				"text": `${course.name}`,
				"classes": "table-header-width"
			})
			coursePanel.parentFormValue = type
			coursePanel.tags.push(new Tag(course.name, preText, true, type, course.id))
		}
	}

	console.log(coursePanel.tags)

	if (coursePanel.tags.length === 0) {
		coursePanel.tags.push(new Tag("All learning", null, false))
		coursePanel.parentFormValue = 'all-learning'
		chartHeadings.push({
			"text": `Completions`,
			"classes": "table-header-width"
		})
	}

	let total = 0
	chartData.forEach(xy => {
		total = total + xy['y']
	})
	
	res.render("/course-report/report.html", {Xaxis, XaxisUnit, chartData, total, dateRange,
		chartRows,
		chartHeadings,
		tooltipFormat,
		startDate,
		endDate,
		chartHeading,
		includeSubdepartments,
		mandatoryLearnings,
		grades,
		professions,
		reportingOnPanel,
		gradePanel,
		profPanel,
		coursePanel,
		dateTagPanel})
})

router.get('/reporting/completed-learning', (req, res) => {

	let axisAndData
	let ticksConf
	let tooltipFormat
	let XaxisUnit
	let Xaxis = []
	let chartData = []
	let chartHeading = "Time"
	let selectedCourses = []

	dateRange = 'today'
	const dateTagPanel = new TagPanel([])
	tooltipFormat = "haaa"
	ticksConf = {span: 1, metric: 'hour'}
	axisAndData = getAxisAndData(selectedCourses, tooltipFormat, 50, 200, tooltipFormat, ticksConf, {span: 1, metric: 'hour'}, dayjs().set('hour', 0).set('minute', 0).set('second', 0), dayjs())
	dateTagPanel.tags.push(new Tag('Today', null, false, "date-range", "today"))

	chartData = axisAndData.chartData
	Xaxis = axisAndData.Xaxis
	XaxisUnit = ticksConf.metric
	const reportingOnPanel = getReportingOnPanel([], "Cabinet Office", false)

	let total = 0
	chartData.forEach(xy => {
		total = total + xy['y']
	})

	const coursePanel = new TagPanel([], 'learning')
	for (let i = 0; i < selectedCourses.length; i++) {
		const courseId = selectedCourses[i]
		if (courseId !== '_unchecked') {
			const course = courses[courseId]
			const preText = i > 0 ? 'and' : null
			const type = course.required ? 'required-learning' : 'non-required-learning'
			coursePanel.parentFormValue = type
			coursePanel.tags.push(new Tag(course.name, preText, true, type, course.id))
		}
	}

	if (coursePanel.tags.length === 0) {
		coursePanel.tags.push(new Tag("All learning", null, false))
		coursePanel.parentFormValue = 'all-learning'
	}
	
	res.render("/course-report/report.html", {Xaxis, XaxisUnit, chartData, total, dateRange,
		tooltipFormat,
		chartHeading,
		reportingOnPanel,
		dateTagPanel,
		coursePanel})
})

// Completed learning V1

// router.get('/reporting/completed-learning', (req, res) => {
// 	let axisAndData
// 	let ticksConf
// 	let tooltipFormat
// 	let XaxisUnit
// 	let Xaxis = []
// 	let chartData = []
// 	let chartHeading = "Time"
// 	let dateRange = 'today'

// 	tooltipFormat = "haaa"
// 	ticksConf = {span: 1, metric: 'hour'}
// 	axisAndData = getAxisAndData(50, 200, ticksConf, {span: 1, metric: 'hour'}, dayjs().set('hour', 0).set('minute', 0).set('second', 0), dayjs())
// 	chartData = axisAndData.chartData
// 	Xaxis = axisAndData.Xaxis
// 	XaxisUnit = ticksConf.metric
// 	const reportingOnPanel = getReportingOnPanel([], "Cabinet Office", undefined)
// 	const dateTagPanel = new TagPanel([new Tag('Today', null, false, "date-range", "today")])
// 	res.render("/completed-learning-report.html", {Xaxis, XaxisUnit, chartData, dateRange,
// 		tooltipFormat,
// 		chartHeading,
// 		reportingOnPanel,
// 		dateTagPanel})
// })

const getReportingOnPanel = (mandatoryLearning, department, includeSubdepartments) => {
	const tagPanel = new TagPanel([])
	const depPanel = new Tag(department, null, false)
	let mandatoryLearningPanels = []
	let subDepPanel
	const filteredMandatoryLearning = mandatoryLearning.filter(mL => mL !== "_unchecked")
	if (filteredMandatoryLearning.length !== 2) {
		filteredMandatoryLearning.forEach(mL => {
			let text = mandatoryLearningMap[mL]
			mandatoryLearningPanels.push(new Tag(text, null, true, "mandatory-learning", mL))
		})
	}
	if (includeSubdepartments && includeSubdepartments !== "_unchecked") {
		subDepPanel = new Tag("All subdepartments", "and", true, "include-subdepartments", "include-subdepts")
	}
	if (mandatoryLearningPanels.length > 0) {
		depPanel.preText = "for"
		tagPanel.tags.push(...mandatoryLearningPanels)	
	}
	tagPanel.tags.push(depPanel)
	if (subDepPanel) {
		tagPanel.tags.push(subDepPanel)	
	}
	return tagPanel
}

const getAxisAndData = (selectedCourses, tooltipFormat, min, max, ticksConf, dataConf, start, end) => {
	const chartRows = []
	let next = start
	if (ticksConf.metric === 'hour') {
		// next = next.set('minute', 0).set('second', 0)
	} else if (ticksConf.metric === 'day') {
		next = next.set('hour', 0).set('minute', 0).set('second', 0)
	} else if (ticksConf.metric === 'month') {
		next = next.set('date', 1)
	}
	const chartData = []
	const Xaxis = []
	while (next < end) {
		Xaxis.push(next.valueOf())
		next = next.add(ticksConf.span, ticksConf.metric)
	}
	next = start
	while (next < end) {
		let total = 0
		let chartRow = [{'text': next.format(tooltipFormat)}]
		if (selectedCourses.length > 0) {
			selectedCourses.forEach(c => {
				const count = Math.floor(Math.random() * (max - min)) + min
				total = total + count
				chartRow.push({'text': count, 'format': 'numeric'})
			})
		} else {
			Object.values(courses).forEach(c => {
				total = total + Math.floor(Math.random() * (max - min)) + min
			})
			chartRow.push({'text': total, 'format': 'numeric'})
		}
		chartData.push({x: next.valueOf(), y: total})
		next = next.add(dataConf.span, dataConf.metric)
		chartRows.push(chartRow)
	}

	return {
		Xaxis,
		chartData,
		chartRows
	}
}

// router.post('/reporting/completed-learning', (req, res) => {
// 	const dateRange = req.body['date-range']
// 	const startDate = req.body['start_date']
// 	const endDate = req.body['end_date']
// 	const remove = req.query['remove']
// 	let removeFormName
// 	let removeFormValue
// 	if (remove) {
// 		[removeFormName,removeFormValue] = remove.split(",")
// 	}
// 	let includeSubdepartments = req.body['include-subdepartments']
// 	if (removeFormName == 'include-subdepartments' && removeFormValue == 'include-subdepts') {
// 		includeSubdepartments = "_unchecked"
// 	}
	
// 	let mandatoryLearning = [req.body['mandatory-learning']].flat().filter(g => g !== undefined)
// 	if (removeFormName == 'mandatory-learning') {
// 		mandatoryLearning = mandatoryLearning.filter(m => m !== removeFormValue)
// 	}
	
// 	const mandatoryLearnings = {}
// 	Object.keys(mandatoryLearningMap).forEach(mL => mandatoryLearnings[mL] = mandatoryLearning.includes(mL))

// 	let flatGrades = [req.body['grade']].flat().filter(g => g !== undefined)
// 	if (removeFormName == 'grade') {
// 		flatGrades = flatGrades.filter(m => m !== removeFormValue)
// 	}
// 	const grades = {}
// 	Object.keys(allGrades).forEach(g => grades[g] = flatGrades.includes(g))

// 	let flatProfessions = [req.body['profession']].flat().filter(g => g !== undefined)
// 	if (removeFormName == 'profession') {
// 		flatProfessions = flatProfessions.filter(m => m !== removeFormValue)
// 	}
// 	const professions = {}
// 	Object.keys(allProfessions).forEach(p => professions[p] = flatProfessions.includes(p))

// 	let axisAndData
// 	let ticksConf
// 	let tooltipFormat
// 	let XaxisUnit
// 	let Xaxis = []
// 	let chartData = []
// 	let chartHeading = "Time"

// 	const dateTagPanel = new TagPanel([])

// 	if (dateRange === 'today') {
// 		tooltipFormat = "haaa"
// 		ticksConf = {span: 1, metric: 'hour'}
// 		axisAndData = getAxisAndData(50, 200, ticksConf, {span: 1, metric: 'hour'}, dayjs().set('hour', 0).set('minute', 0).set('second', 0), dayjs())
// 		dateTagPanel.tags.push(new Tag('Today', null, false, "date-range", "today"))
// 	} else if (dateRange == 'past-seven-days') {
// 		// Ticks: 1 day
// 		// Data: every 1 day
// 		tooltipFormat = "eeee d MMMM"
// 		ticksConf = {span: 1, metric: 'day'}
// 		axisAndData = getAxisAndData(50, 200, ticksConf, {span: 1, metric: 'day'}, dayjs().set('hour', 0).set('minute', 0).set('second', 0).subtract(7, 'day'), dayjs())
// 		chartHeading = "Day"
// 		dateTagPanel.tags.push(new Tag('Past seven days', null, false, "date-range", "past-seven-days"))
// 	} else if (dateRange == 'past-month') {
// 		// Ticks: 3 days
// 		// Data: every week
// 		tooltipFormat = "d MMMM yyyy"
// 		ticksConf = {span: 3, metric: 'day'}
// 		axisAndData = getAxisAndData(300, 2000, ticksConf, {span: 7, metric: 'day'}, dayjs().set('hour', 0).set('minute', 0).set('second', 0).subtract(1, 'month'), dayjs())
// 		chartHeading = "Week"
// 		dateTagPanel.tags.push(new Tag('Past month', null, false, "date-range", "past-month"))
// 	} else if (dateRange == 'past-year') {
// 		// Ticks: 1 month
// 		// Data: every week
// 		tooltipFormat = "d MMMM yyyy"
// 		ticksConf = {span: 1, metric: 'month'}
// 		axisAndData = getAxisAndData(300, 2000, ticksConf, {span: 2, metric: 'week'}, dayjs().set('hour', 0).set('minute', 0).set('second', 0).subtract(1, 'year'), dayjs())
// 		chartHeading = "Month"
// 		dateTagPanel.tags.push(new Tag('Past year', null, false, "date-range", "past-year"))
// 	} else if (dateRange == 'custom') {
// 		let from = startDate.split("/")
// 		let to = endDate.split("/")
// 		let customFrom = dayjs(from[1] + "/" + from[0] + "/" + from[2]).set('hour', 0).set('minute', 0).set('second', 0)
// 		let customTo = dayjs(to[1] + "/" + to[0] + "/" + to[2])
// 		dateTagPanel.tags.push(new Tag(customFrom.format('D MMMM YYYY'), "between", false, "start_date", from))
// 		dateTagPanel.tags.push(new Tag(customTo.format('D MMMM YYYY'), "and", false, "end_date", to))

// 		const dayDiff = customTo.diff(customFrom, 'days')
// 		console.log(dayDiff)
// 		if (dayDiff == 1) {
// 			tooltipFormat = "haaa"
// 			ticksConf = {span: 1, metric: 'hour'}
// 			axisAndData = getAxisAndData(5, 20, ticksConf, {span: 1, metric: 'hour'}, customFrom, customTo)
// 		} else if (dayDiff > 1 && dayDiff < 7) {
// 			tooltipFormat = "eeee d MMMM"
// 			ticksConf = {span: 1, metric: 'day'}
// 			axisAndData = getAxisAndData(50, 200, ticksConf, {span: 1, metric: 'day'}, customFrom, customTo)
// 			chartHeading = "Day"
// 		} else if (dayDiff > 7 && dayDiff < 30) {
// 			tooltipFormat = "eeee d MMMM"
// 			ticksConf = {span: 3, metric: 'day'}
// 			axisAndData = getAxisAndData(300, 2000, ticksConf, {span: 7, metric: 'day'}, customFrom, customTo)
// 			chartHeading = "Week"
// 		} else if (dayDiff > 30 && dayDiff < 180) {
// 			tooltipFormat = "d MMMM yyyy"
// 			ticksConf = {span: 7, metric: 'day'}
// 			axisAndData = getAxisAndData(300, 2000, ticksConf, {span: 7, metric: 'day'}, customFrom, customTo)
// 			chartHeading = "Month"
// 		} else if (dayDiff > 180) {
// 			tooltipFormat = "d MMMM yyyy"
// 			ticksConf = {span: 1, metric: 'month'}
// 			axisAndData = getAxisAndData(400, 20000, ticksConf, {span: 2, metric: 'week'}, customFrom, customTo)
// 			chartHeading = "Month"
// 		}
// 	}
// 	// chartData = Xaxis.map(x => (Math.random() * (max - min)) + min)

// 	chartData = axisAndData.chartData
// 	Xaxis = axisAndData.Xaxis
// 	XaxisUnit = ticksConf.metric

// 	const gradePanel = new TagPanel([])
// 	for (let i = 0; i < flatGrades.length; i++) {
// 		const gradeVal = flatGrades[i];
// 		if (gradeVal !== '_unchecked') {
// 			if (i===0) {
// 				gradePanel.tags.push(new Tag(allGrades[gradeVal], null, true, "grade", gradeVal))
// 			} else {
// 				gradePanel.tags.push(new Tag(allGrades[gradeVal], "and", true, "grade", gradeVal))
// 			}
// 		}
// 	}
// 	const profPanel = new TagPanel([])
// 	for (let i = 0; i < flatProfessions.length; i++) {
// 		const profVal = flatProfessions[i];
// 		if (profVal !== '_unchecked') {
// 			if (i===0) {
// 				profPanel.tags.push(new Tag(allProfessions[profVal], null, true, "profession", profVal))
// 			} else {

// 				profPanel.tags.push(new Tag(allProfessions[profVal], "and", true, "profession", profVal))
// 			}
// 		}
// 	}

// 	// const combined = Xaxis.map((e, i) => {
// 	// 	return [{"text": e.replaceAll('"', '')}, {"text": chartData[i]}]
// 	// })

// 	const reportingOnPanel = getReportingOnPanel(mandatoryLearning, "Cabinet Office", includeSubdepartments)
	
// 	res.render("/completed-learning-report.html", {Xaxis, XaxisUnit, chartData, dateRange,
// 		tooltipFormat,
// 		startDate,
// 		endDate,
// 		chartHeading,
// 		includeSubdepartments,
// 		mandatoryLearnings,
// 		grades,
// 		professions,
// 		reportingOnPanel,
// 		gradePanel,
// 		profPanel,
// 		dateTagPanel})
// })