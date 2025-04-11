import { date, useQuasar } from 'quasar';
import BranchDepartmentSelect from 'src/resources/JuanHR/components/Selects/BranchDepartmentSelect';
import BranchSelect from 'src/resources/JuanHR/components/Selects/BranchSelect';
import EmployeeSelect from 'src/resources/JuanHR/components/Selects/EmployeeSelect';
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

export default {
	components: {
		BranchSelect,
		BranchDepartmentSelect,
		EmployeeSelect,
	},

	setup() {
		let store = useStore();
		let $q = useQuasar();

		let generatedPayrollData = ref([]);

		let payrollParameters = ref({
			column_ref: 0,
			column_data: [],
			payroll_schedule: 'S',
			month: null,
			year: null,
			payroll_start_date: null,
			payroll_end_date: null,
			term: 1,
			late_rules: [],
			undertime_rules: [],
			overbreak_rules: [],
		});

		let columns = ref([
			{ name: 'employee', align: 'left', label: 'Employee', field: 'employee', sortable: true },
			{ name: 'basic_salary', align: 'center', label: 'Basic Salary', field: 'basic_salary', sortable: true },
			{ name: 'overtime', align: 'center', label: 'OT|Hol', field: 'overtime', sortable: true },
			{ name: 'regular_pay', align: 'center', label: 'Regular Pays', field: 'regular_pay', sortable: true },
			{ name: 'night_diff', align: 'center', label: 'Night Diff.', field: 'night_diff', sortable: true },
			{ name: 'allowance', align: 'center', label: 'Allowance', field: 'allowance', sortable: true },
			{ name: 'additional', align: 'center', label: 'Additional', field: 'additional', sortable: true },
			{ name: 'benefits', align: 'center', label: 'Benefits', field: 'benefits', sortable: true },
			{ name: 'absences', align: 'center', label: 'Absences', field: 'absences', sortable: true },
			{ name: 'late', align: 'center', label: 'Late', field: 'lates', sortable: true },
			{ name: 'undertime', align: 'center', label: 'Undertime', field: 'undertimes', sortable: true },
			{ name: 'overbreak', align: 'center', label: 'Overbreak', field: 'overbreaks', sortable: true },
			{ name: 'deductions', align: 'center', label: 'Deductions', field: 'deductions', sortable: true },
			{ name: 'tax', align: 'center', label: 'Tax', field: 'tax', sortable: true },
			{ name: 'take_home', align: 'center', label: 'Total', field: 'take_home', sortable: true },
			{ name: 'remarks', align: 'center', label: 'Remarks', field: 'remarks', sortable: false },
		]);

		let nonSuccessPayroll = ref([]);

		let nonSuccessColumns = ref([
			{ name: 'employee', align: 'left', label: 'Employee', field: 'employee', sortable: true },
			{ name: 'remarks', align: 'center', label: 'Remarks', field: 'remarks', sortable: false },
		]);

		let options = ref({
			column_ref: [
				{ label: 'Branch', value: 0 },
				{ label: 'Departments', value: 1 },
				{ label: 'Employees', value: 2 },
			],
			payroll_schedule: [
				{ label: 'Semi', value: 'S' },
				{ label: 'Weekly', value: 'W' },
				{ label: 'Monthly', value: 'M' },
			],
			term: [
				{ label: 'First Term', value: 1 },
				{ label: 'Second Term', value: 2 },
				{ label: 'Third Term', value: 3 },
				{ label: 'Fourth Term', value: 4 },
			],
			employee_id: [],
			branch_dept_id: [],
		});

		let rules = ref({
			month_year: [(val) => !!val || 'Field is required'],
			payroll_start_date: [(val) => !!val || 'Field is required'],
			payroll_end_date: [
				(val) => {
					return new Promise((resolve, reject) => {
						if (!!val) {
							let startDate = new Date(payrollParameters.value.payroll_start_date).getTime();
							let endDate = new Date(val).getTime();
							!(startDate <= endDate)
								? resolve('End Date must be greater than Start Date.')
								: resolve(true);
						} else {
							resolve('Field is required');
						}
					});
				},
			],
			newDates: [
				(val) => {
					return new Promise((resolve, reject) => {
						if (
							payrollParameters.value.payroll_start_date === null ||
							payrollParameters.value.payroll_end_date === null
						) {
							resolve('Start and End Date must be filled.');
						} else {
							resolve(true);
						}
					});
				},
			],
			branch_dept_id: [(val) => !!val || 'Field is required'],
		});

		let tab = ref('lates');

		let triggers = ref({
			isGeneratingPayroll: false,
		});

		let days = ref([]);
		let late_date = ref([]);
		let undertime_date = ref([]);
		let overbreak_date = ref([]);

		const getEmployees = computed(() => store.getters['JuanHR/Employee/Information/GET_EMPLOYEES']);
		const getPayrollInformation = computed(
			() => store.getters['JuanHR/Payroll/Information/GET_PAYROLL_INFORMATION']
		);

		let selectedBranch = ref({});

		/**
		 * Get Selected Month And Year
		 * @param value
		 * @param reason
		 */
		let month_year = ref(null);
		let formatMonthYear = ref(null)
		let qMonthYearProxy = ref(null);
		let monthYearSelection = (value, reason) => {
			month_year.value = date.formatDate(value, 'MMMM YYYY');
			formatMonthYear.value = date.formatDate(value, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
			if (reason === 'month') {
				qMonthYearProxy.value.hide();
			}
		};

		/**
		 * Get selected branch data
		 */
		watch(selectedBranch, (value) => {
			if (value.savedOptions.length > 0) {
				selectedBranch.value.savedOptions = value.savedOptions.filter(function (el) {
					return el != null;
				});
				payrollParameters.value.column_data = value.selectedLists;
			} else {
				payrollParameters.value.column_data = [value.selectedLists];
			}
		});

		let selectedBranchDepartment = ref({});
		/**
		 * Get selected department data
		 */
		watch(selectedBranchDepartment, (value) => {
			if (value.savedOptions.length > 0) {
				selectedBranchDepartment.value.savedOptions = value.savedOptions.filter(function (el) {
					return el != null;
				});
				payrollParameters.value.column_data = value.selectedLists;
			} else {
				payrollParameters.value.column_data = [0];
			}
		});

		let selectedEmployee = ref({});
		/**
		 * Get selected Employee data
		 */
		watch(selectedEmployee, (value) => {
			if (value.savedOptions.length > 0) {
				selectedEmployee.value.savedOptions = value.savedOptions.filter(function (el) {
					return el != null;
				});
				payrollParameters.value.column_data = value.selectedLists;
			}
		});

		/**
		 * Get selected dates
		 * @param date
		 */
		let optionsFn = (date) => {
			return (
				date >= payrollParameters.value.payroll_start_date && date <= payrollParameters.value.payroll_end_date
			);
		};

		let ruleTimeOptions = ref([
			{
				label: 'All Time',
				value: 0,
			},
			{
				label: '24 Hour Format',
				value: '24:00:00',
			},
		]);
		let lateRuleDates = ref([]);
		let undertimeRuleDates = ref([]);
		let overbreakRuleDates = ref([]);
		let lateRules = ref([]);
		let undertimeRules = ref([]);
		let overbreakRules = ref([]);
		let lateCustomCOnfig = ref(0);
		let undertimeCustomCOnfig = ref(0);
		let overbreakCustomCOnfig = ref(0);
		/**
		 * Add Selected Dates to Custom Configuration
		 * @param dateValue
		 */
		let addSelectedDates = (dateValue) => {
			switch (dateValue) {
				case 'late_rule_date':
					lateRuleDates.value.push({
						id: lateCustomCOnfig.value++,
					});
					break;
				case 'undertime_rule_date':
					undertimeRuleDates.value.push({
						id: undertimeCustomCOnfig.value++,
					});
					break;
				case 'overbreak_rule_date':
					overbreakRuleDates.value.push({
						id: overbreakCustomCOnfig.value++,
					});
					break;
			}
		};

		let undertimeRuleId = ref([0]);
		let overbreakRuleId = ref([0]);
		/**
		 * Custom Rules to over ride configuration
		 * @param ruleValue
		 */
		let addRules = (ruleValue, arrayID) => {
			switch (ruleValue) {
				case 'late_rules':
					let lateIndex = lateRuleDates.value.findIndex((a) => a.id === arrayID);
					if (lateRuleDates.value[lateIndex].lateConfRules) {
						if (lateRuleDates.value[lateIndex].lateConfRules.length) {
							lateRuleDates.value[lateIndex].lateConfRules.push({
								range1: null,
								range2: null,
								affectedTime: 0,
								lateDeduction: 0,
								multiplierCheck: 0,
								multiplier: 0,
								customValue: 0,
								considerAbsent: 0,
								customValueCheck: 0,
							});
						}
					} else {
						lateRuleDates.value[lateIndex].lateConfRules = [
							{
								range1: null,
								range2: null,
								affectedTime: 0,
								lateDeduction: 0,
								multiplierCheck: 0,
								multiplier: 0,
								customValue: 0,
								considerAbsent: 0,
								customValueCheck: 0,
							},
						];
					}
					break;
				case 'undertime_rules':
					let undertimeIndex = undertimeRuleDates.value.findIndex((a) => a.id === arrayID);
					if (undertimeRuleDates.value[undertimeIndex].undertimeConfRules) {
						if (undertimeRuleDates.value[undertimeIndex].undertimeConfRules.length) {
							undertimeRuleDates.value[undertimeIndex].undertimeConfRules.push({
								range1: null,
								range2: null,
								affectedTime: 0,
								undertimeDeduction: 0,
								multiplierCheck: 0,
								multiplier: 0,
								customValue: 0,
								considerAbsent: 0,
								customValueCheck: 0,
							});
						}
					} else {
						undertimeRuleDates.value[undertimeIndex].undertimeConfRules = [
							{
								range1: null,
								range2: null,
								affectedTime: 0,
								undertimeDeduction: 0,
								multiplierCheck: 0,
								multiplier: 0,
								customValue: 0,
								considerAbsent: 0,
								customValueCheck: 0,
							},
						];
					}
					break;
				case 'overbreak_rules':
					let overbreakIndex = overbreakRuleDates.value.findIndex((a) => a.id === arrayID);
					if (overbreakRuleDates.value[overbreakIndex].overbreakConfRules) {
						if (overbreakRuleDates.value[overbreakIndex].overbreakConfRules.length) {
							overbreakRuleDates.value[overbreakIndex].overbreakConfRules.push({
								range1: null,
								range2: null,
								affectedTime: 0,
								overbreakDeduction: 0,
								multiplierCheck: 0,
								multiplier: 0,
								customValue: 0,
								considerAbsent: 0,
								customValueCheck: 0,
							});
						}
					} else {
						overbreakRuleDates.value[overbreakIndex].overbreakConfRules = [
							{
								range1: null,
								range2: null,
								affectedTime: 0,
								overbreakDeduction: 0,
								multiplierCheck: 0,
								multiplier: 0,
								customValue: 0,
								considerAbsent: 0,
								customValueCheck: 0,
							},
						];
					}
					break;
			}
		};
		let qEndDateProxy = ref(null);

		const generatePayrollForm = ref(null);

		/**
		 * Generate Payroll
		 */
		let generatePayroll = () => {
			generatePayrollForm.value.validate().then((success) => {
				if (success) {
					triggers.value.isGeneratingPayroll = true;

					const month_year_params = new Date(formatMonthYear.value);
					payrollParameters.value.month = month_year_params.getMonth() + 1;
					payrollParameters.value.year = month_year_params.getFullYear();

					//Custom Config for Lates
					if (late_date.value.length && lateRuleDates.value.length) {
						let late_rule = [];
						lateRuleDates.value.forEach((rule) => {
							if (rule.lateConfRules) {
								rule.lateConfRules.forEach((lateRules) => {
									late_rule.push(lateRules);
								});
							}
						});
						let customLate = {
							late_dates: late_date.value,
							late_rules: late_rule,
						};
						payrollParameters.value.late_rules = JSON.stringify(customLate);
					} else {
						payrollParameters.value.late_rules = JSON.stringify([]);
					}

					//Custom Config for Undertime
					if (undertime_date.value.length && undertimeRuleDates.value.length) {
						let undertime_rule = [];
						undertimeRuleDates.value.forEach((rule) => {
							if (rule.undertimeConfRules) {
								rule.undertimeConfRules.forEach((undertimeRules) => {
									undertime_rule.push(undertimeRules);
								});
							}
						});
						let customUnderTime = {
							undertime_dates: undertime_date.value,
							undertime_rules: undertime_rule,
						};
						payrollParameters.value.undertime_rules = JSON.stringify(customUnderTime);
					} else {
						payrollParameters.value.undertime_rules = JSON.stringify([]);
					}

					//Custom Config for overbreak
					if (overbreak_date.value.length && overbreakRuleDates.value.length) {
						let overbreak_rule = [];
						overbreakRuleDates.value.forEach((rule) => {
							if (rule.overbreakConfRules) {
								rule.overbreakConfRules.forEach((overbreakRules) => {
									overbreak_rule.push(overbreakRules);
								});
							}
						});
						let customOverBreak = {
							undertime_dates: overbreak_date.value,
							undertime_rules: overbreak_rule,
						};
						payrollParameters.value.overbreak_rules = JSON.stringify(customOverBreak);
					} else {
						payrollParameters.value.overbreak_rules = JSON.stringify([]);
					}
					if (typeof overbreak_date.value.length && overbreakRules.value.length === 0) {
						payrollParameters.value.overbreak_rules = JSON.stringify([]);
					} else {
						let customOverBreak = {
							overbreak_dates: overbreak_date.value,
							overbreak_rules: overbreakRules.value,
						};
						payrollParameters.value.overbreak_rules = JSON.stringify(customOverBreak);
					}

					store
						.dispatch('JuanHR/Payroll/Information/GENERATE_PAYROLL', payrollParameters.value)
						.then((response) => {
							triggers.value.isGeneratingPayroll = false;
							if (response.data.consolidated_results) {
								if (response.data.consolidated_results.success) {
									let success = Object.values(response.data.consolidated_results.success);
									generatedPayrollData.value = success.map((row) => {
										return {
											payroll_id: row.payroll_id,
											employee: row.employee,
											basic_salary: row.basic_salary,
											night_diff: row.daily.total_night_differential,
											overtime: row.overtime.total_ot_holidays,
											regular_pay: row.overtime.total_regular,
											allowance: row.allowance.total_amount,
											additional: row.adjustments.total_additionals,
											lates: row.daily.total_lates,
											undertimes: row.daily.total_undertime,
											overbreaks: row.daily.total_overbreak,
											absences: row.daily.total_absences,
											benefits: row.benefits.total_amount,
											loans: row.loans.total_amount,
											deductions: row.adjustments.total_deductions,
											tax: row.tax,
											remarks: row.remarks,
											take_home:
												row.basic_salary +
												row.daily.total_night_differential +
												row.overtime.total_ot_holidays +
												row.overtime.total_regular +
												row.allowance.total_amount +
												row.adjustments.total_additionals -
												(row.daily.total_lates +
													row.daily.total_undertime +
													row.daily.total_absences +
													row.benefits.total_amount +
													row.loans.total_amount +
													row.adjustments.total_deductions +
													row.tax),
											// take_home: (row.basic_salary + row.daily.total_night_differential + row.overtime.total_ot_holidays + row.overtime.total_regular + row.allowance.total_amount + row.adjustments.total_additionals) - (row.daily.total_lates + row.daily.total_undertime + row.daily.total_overbreak + row.daily.total_absences + row.benefits.total_amount + row.loans.total_amount + row.adjustments.total_deductions + row.tax)
										};
									});
								}
								if (response.data.consolidated_results.non_success) {
									let nonSuccess = Object.values(response.data.consolidated_results.non_success);
									nonSuccessPayroll.value = nonSuccess;
								}
							}
							$q.notify({
								position: 'top-right',
								classes: 'juanhr-alert juanhr-alert-simple q-px-lg q-pt-none q-pb-none',
								html: true,
								actions: [{ icon: 'iconfont juanhr-close', color: 'white' }],
								message:
									response.data.consolidated_results.status === 'success'
										? '<div class="message">Success,</div> Payroll has been generated.'
										: '<div class="message">Failed,</div>' +
										  response.data.consolidated_results.message,
							});
						})
						.catch((response) => {
							triggers.value.isGeneratingPayroll = false;
							$q.notify({
								position: 'top-right',
								classes: 'juanhr-alert juanhr-alert-simple q-px-lg q-pt-none q-pb-none',
								html: true,
								actions: [{ icon: 'iconfont juanhr-close', color: 'white' }],
								message: '<div class="message">Oops,</div> Something went wrong.',
							});
						});
				}
			});
		};

		onMounted(() => {
			let currentYear = new Date().getFullYear().toString();
			let currentMonth = ('0' + (new Date().getMonth() + 1)).slice(-2).toString();
			let value = currentYear + '/' + currentMonth + '/01';
			month_year.value = date.formatDate(value, 'MMMM YYYY');
			formatMonthYear.value = date.formatDate(value, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
		});

		return {
			date,
			addRules,
			addSelectedDates,
			columns,
			generatePayroll,
			generatedPayrollData,
			generatePayrollForm,
			late_date,
			lateRuleDates,
			lateRules,
			// lateRuleId,
			month_year,
			nonSuccessPayroll,
			nonSuccessColumns,
			options,
			optionsFn,
			overbreak_date,
			overbreakRuleDates,
			overbreakRules,
			payrollParameters,
			rules,
			ruleTimeOptions,
			selectedBranch,
			selectedBranchDepartment,
			selectedEmployee,
			tab,
			triggers,
			undertime_date,
			undertimeRuleDates,
			undertimeRules,
			qEndDateProxy,
			monthYearSelection,
			qMonthYearProxy,
		};
	},
};
