<template>
  <q-scroll-area class="generate-payroll-scroll">
    <div class="row">
      <div class="col-12">
        <div class="float-right q-pr-sm q-pt-sm">
          <q-btn
            stretch
            flat
            icon="iconfont juanhr-close"
            color="amber-8"
            size="sm"
            @click="$router.go(-1)"
          />
        </div>
      </div>
    </div>

    <q-form ref="generatePayrollForm">
      <div class="row">
        <div class="col-4 q-pa-md">
          <small>Payroll For</small>
          <q-select
            dense
            stack-label
            outlined
            map-options
            emit-value
            v-model="payrollParameters.column_ref"
            :options="options.column_ref"
          />
        </div>

        <div class="col-8 q-pa-md">
          <div v-if="payrollParameters.column_ref === 0">
            <small>Branch(s)</small>
            <branch-select class="selectedOption" v-model:input="selectedBranch" />
          </div>
          <div v-if="payrollParameters.column_ref === 1">
            <small>Department(s)</small>
            <branch-department-select v-model:input="selectedBranchDepartment" />
          </div>
          <div v-if="payrollParameters.column_ref === 2">
            <small>Employee(s)</small>
            <employee-select v-model:input="selectedEmployee" />
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col q-pa-md q-mb-md">
          <small>Payroll Schedule</small>
          <q-select
            dense
            stack-label
            outlined
            map-options
            emit-value
            v-model="payrollParameters.payroll_schedule"
            :options="options.payroll_schedule"
          />
        </div>
        <div class="col q-pa-md q-mb-md">
          <small>Term</small>
          <q-select
            dense
            stack-label
            outlined
            map-options
            emit-value
            v-model="payrollParameters.term"
            :options="options.term"
          />
        </div>
        <div class="col q-pa-md">
          <small>Month-Year</small>
          <q-input
            stack-label
            dense
            outlined
            bg-color="white"
            v-model="month_year"
            :rules="rules.month_year"
          >
            <!-- :value="date.formatDate(model_value, 'MMMM YYYY')" -->
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qMonthYearProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    color="kahel"
                    emit-immediately
                    default-view="Years"
                    v-model="month_year"
                    subtitle="Month-Year"
                    :title="month_year"
                    years-in-month-view
                    @update:model-value="monthYearSelection"
                  >
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col q-pa-md">
          <small>Cut-Off Start Date</small>
          <q-input
            stack-label
            dense
            outlined
            bg-color="white"
            v-model="payrollParameters.payroll_start_date"
            :rules="rules.payroll_start_date"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qStartDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    no-unset
                    color="kahel"
                    mask="YYYY/MM/DD"
                    default-view="Months"
                    subtitle="Cut-Off Start Date"
                    v-model="payrollParameters.payroll_start_date"
                    @update:model-value="$refs.qStartDateProxy.hide()"
                    :title="
                      date.formatDate(
                        payrollParameters.payroll_start_date,
                        'MMM DD, YYYY'
                      )
                    "
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col q-pa-md">
          <small>Cut-Off End Date</small>
          <q-input
            stack-label
            dense
            outlined
            bg-color="white"
            v-model="payrollParameters.payroll_end_date"
            :rules="rules.payroll_end_date"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qEndDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    no-unset
                    color="kahel"
                    mask="YYYY/MM/DD"
                    default-view="Months"
                    subtitle="Cut-Off End Date"
                    v-model="payrollParameters.payroll_end_date"
                    @update:model-value="$refs.qEndDateProxy.hide()"
                    :title="
                      date.formatDate(payrollParameters.payroll_end_date, 'MMM DD, YYYY')
                    "
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <div style="padding: 10px">
        <q-card>
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="amber-10"
            indicator-color="amber-10"
            no-caps
            align="left"
          >
            <q-tab name="lates" label="Late Rules" />
            <q-tab name="undertime" label="Undertime Rules" />
            <q-tab name="overbreak" label="Overbreak Rules" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" keep-alive animated>
            <q-tab-panel name="lates">
              <q-btn
                label="Add Late Rule Configuration"
                no-caps
                dense
                outline
                color="amber-10"
                icon="iconfont juanhr-add"
                @click="addSelectedDates('late_rule_date')"
              />

              <div class="col-12">
                <q-list v-if="lateRuleDates.length > 0">
                  <q-item
                    v-for="(lateDate, index) in lateRuleDates"
                    :key="lateDate"
                    :id="`${index + 1}`"
                    class="q-mt-md rounded-borders"
                    style="border: 1px solid gray"
                  >
                    <q-item-section>
                      <div class="row">
                        <div class="col-11"></div>
                        <div class="col-1">
                          <q-btn
                            stretch
                            flat
                            round
                            icon="iconfont juanhr-close"
                            color="kahel"
                            style="float: right; border-radius: 50%"
                            @click="lateRuleDates.splice(index, 1)"
                          />
                        </div>
                        <div class="col-10 q-pr-md">
                          <small> Selected Date(s) </small>
                          <q-select
                            class="payrollConfig-selected-dates"
                            stack-label
                            dense
                            outlined
                            use-chips
                            multiple
                            fill-input
                            color="kahel"
                            bg-color="white"
                            v-model="late_date[index]"
                          >
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy
                                  ref="qEndDateProxy"
                                  transition-show="scale"
                                  transition-hide="scale"
                                >
                                  <q-date
                                    v-model="late_date[index]"
                                    color="kahel"
                                    mask="YYYY-MM-DD"
                                    :options="optionsFn"
                                    multiple
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-select>
                        </div>

                        <div class="col-2">
                          <small></small>
                          <q-btn
                            class="q-pa-sm"
                            label="Add Schedule Rule"
                            no-caps
                            dense
                            outline
                            color="amber-10"
                            icon="iconfont juanhr-add"
                            @click="addRules('late_rules', lateDate.id)"
                          />
                        </div>
                        <div class="col-12">
                          <div v-if="lateDate.lateConfRules">
                            <q-list v-if="lateDate.lateConfRules.length">
                              <q-item
                                v-for="(late_rule, index) in lateDate.lateConfRules"
                                :key="index"
                                class="q-mt-md rounded-borders"
                                style="border: 1px solid gray"
                              >
                                <q-item-section>
                                  <div class="row">
                                    <div class="col-11"></div>
                                    <div class="col-1">
                                      <q-btn
                                        stretch
                                        flat
                                        round
                                        icon="iconfont juanhr-close"
                                        color="kahel"
                                        style="float: right; border-radius: 50%"
                                        @click="lateDate.lateConfRules.splice(index, 1)"
                                      />
                                    </div>
                                    <div class="col-12">
                                      <div class="row">
                                        <div class="col-1">Rule Time</div>
                                        <div class="col-5 q-pr-md">
                                          <q-select
                                            outlined
                                            dense
                                            v-model="late_rule.affectedTime"
                                            :options="ruleTimeOptions"
                                            map-options
                                            emit-value
                                          />
                                        </div>
                                        <div class="col-1">from</div>
                                        <div class="col-2 q-pr-md">
                                          <q-input
                                            stack-label
                                            dense
                                            outlined
                                            v-model="late_rule.range1"
                                            mask="##:##:##"
                                            configs
                                            :disable="
                                              late_rule.affectedTime === 0 ||
                                              late_rule.affectedTime === null
                                            "
                                          >
                                            <template v-slot:append>
                                              <q-icon
                                                name="access_time"
                                                class="cursor-pointer"
                                              >
                                                <q-popup-proxy
                                                  cover
                                                  transition-show="scale"
                                                  transition-hide="scale"
                                                >
                                                  <q-time
                                                    v-model="late_rule.range1"
                                                    with-seconds
                                                  >
                                                    <div
                                                      class="row items-center justify-end"
                                                    >
                                                      <q-btn
                                                        v-close-popup
                                                        label="Close"
                                                        color="primary"
                                                        flat
                                                      />
                                                    </div>
                                                  </q-time>
                                                </q-popup-proxy>
                                              </q-icon>
                                            </template>
                                          </q-input>
                                        </div>
                                        <div class="col-1">to</div>
                                        <div class="col-2">
                                          <q-input
                                            stack-label
                                            dense
                                            outlined
                                            v-model="late_rule.range2"
                                            mask="##:##:##"
                                            :disable="
                                              late_rule.affectedTime === 0 ||
                                              late_rule.affectedTime === null
                                            "
                                            configs
                                          >
                                            <template v-slot:append>
                                              <q-icon
                                                name="access_time"
                                                class="cursor-pointer"
                                              >
                                                <q-popup-proxy
                                                  cover
                                                  transition-show="scale"
                                                  transition-hide="scale"
                                                >
                                                  <q-time
                                                    v-model="late_rule.range2"
                                                    with-seconds
                                                  >
                                                    <div
                                                      class="row items-center justify-end"
                                                    >
                                                      <q-btn
                                                        v-close-popup
                                                        label="Close"
                                                        color="primary"
                                                        flat
                                                      />
                                                    </div>
                                                  </q-time>
                                                </q-popup-proxy>
                                              </q-icon>
                                            </template>
                                          </q-input>
                                        </div>
                                      </div>
                                      <div class="row q-pt-md">
                                        <div class="col-6 q-pa-xs">
                                          <div class="row border-gray q-pa-lg">
                                            <div class="col-5">
                                              <q-checkbox
                                                color="amber-10"
                                                :true-value="1"
                                                :false-value="0"
                                                v-model="late_rule.lateDeduction"
                                                configs
                                                :disable="
                                                  late_rule.multiplierCheck === 1 ||
                                                  late_rule.considerAbsent === 1 ||
                                                  late_rule.customValueCheck === 1
                                                "
                                                label="No Deductions"
                                              />
                                            </div>
                                            <div class="col-4">
                                              <q-checkbox
                                                color="amber-10"
                                                :true-value="1"
                                                :false-value="0"
                                                value="false"
                                                v-model="late_rule.multiplierCheck"
                                                configs
                                                :disable="
                                                  late_rule.lateDeduction === 1 ||
                                                  late_rule.considerAbsent === 1
                                                "
                                                label="Multiplier Value"
                                              />
                                            </div>
                                            <div class="col-3">
                                              <q-input
                                                outlined
                                                dense
                                                type="number"
                                                placeholder=""
                                                v-model="late_rule.multiplier"
                                                configs
                                                :disable="
                                                  late_rule.multiplierCheck === null ||
                                                  late_rule.multiplierCheck === 0
                                                "
                                              >
                                              </q-input>
                                            </div>
                                          </div>
                                        </div>
                                        <div class="col-6 q-pa-xs">
                                          <div class="row border-gray q-pa-lg">
                                            <div class="col-5">
                                              <q-checkbox
                                                color="amber-10"
                                                value="false"
                                                :true-value="1"
                                                :false-value="0"
                                                v-model="late_rule.considerAbsent"
                                                configs
                                                :disable="
                                                  late_rule.lateDeduction === 1 ||
                                                  late_rule.multiplierCheck === 1 ||
                                                  late_rule.customValueCheck === 1
                                                "
                                                label="Consider as Absent"
                                              />
                                            </div>
                                            <div class="col-4">
                                              <q-checkbox
                                                :true-value="1"
                                                :false-value="0"
                                                color="amber-10"
                                                value="false"
                                                v-model="late_rule.customValueCheck"
                                                configs
                                                :disable="
                                                  late_rule.lateDeduction === 1 ||
                                                  late_rule.considerAbsent === 1
                                                "
                                                label="Custom Amount"
                                              />
                                            </div>
                                            <div class="col-3">
                                              <q-input
                                                outlined
                                                dense
                                                type="number"
                                                v-model="late_rule.customValue"
                                                configs
                                                :disable="
                                                  late_rule.customValueCheck === null ||
                                                  late_rule.customValueCheck === 0
                                                "
                                                placeholder=""
                                              >
                                              </q-input>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </div>
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-tab-panel>

            <q-tab-panel name="undertime">
              <q-btn
                label="Add Undertime Rule Configuration"
                no-caps
                dense
                outline
                color="amber-10"
                icon="iconfont juanhr-add"
                @click="addSelectedDates('undertime_rule_date')"
              />
              <div class="col-12">
                <q-list v-if="undertimeRuleDates.length > 0">
                  <q-item
                    v-for="(undertimeDate, index) in undertimeRuleDates"
                    :key="index"
                    :id="`${index + 1}`"
                    class="q-mt-md rounded-borders"
                    style="border: 1px solid gray"
                  >
                    <q-item-section>
                      <div class="row">
                        <div class="col-11"></div>
                        <div class="col-1">
                          <q-btn
                            stretch
                            flat
                            round
                            icon="iconfont juanhr-close"
                            color="kahel"
                            style="float: right; border-radius: 50%"
                            @click="undertimeRuleDates.splice(index, 1)"
                          />
                        </div>
                        <div class="col-10 q-pr-md">
                          <small> Selected Date(s) </small>
                          <q-select
                            class="payrollConfig-selected-dates"
                            stack-label
                            dense
                            outlined
                            use-chips
                            multiple
                            fill-input
                            color="kahel"
                            bg-color="white"
                            v-model="undertime_date[index]"
                          >
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy
                                  ref="qEndDateProxy"
                                  transition-show="scale"
                                  transition-hide="scale"
                                >
                                  <q-date
                                    v-model="undertime_date[index]"
                                    mask="YYYY-MM-DD"
                                    color="kahel"
                                    :options="optionsFn"
                                    multiple
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-select>
                        </div>

                        <div class="col-2">
                          <small></small>
                          <q-btn
                            class="q-pa-sm"
                            label="Add Schedule Rule"
                            no-caps
                            dense
                            outline
                            color="amber-10"
                            icon="iconfont juanhr-add"
                            @click="addRules('undertime_rules', undertimeDate.id)"
                          />
                        </div>
                        <div class="col-12">
                          <div v-if="undertimeDate.undertimeConfRules">
                            <q-list v-if="undertimeDate.undertimeConfRules.length">
                              <q-item
                                v-for="(
                                  undertime_rule, index
                                ) in undertimeDate.undertimeConfRules"
                                :key="index"
                                class="q-mt-md rounded-borders"
                                style="border: 1px solid gray"
                              >
                                <q-item-section>
                                  <div class="row">
                                    <div class="col-11"></div>
                                    <div class="col-1">
                                      <q-btn
                                        stretch
                                        flat
                                        round
                                        icon="iconfont juanhr-close"
                                        color="kahel"
                                        style="float: right; border-radius: 50%"
                                        @click="
                                          undertimeDate.undertimeConfRules.splice(
                                            index,
                                            1
                                          )
                                        "
                                      />
                                    </div>
                                    <div class="col-12">
                                      <div class="row">
                                        <div class="col-1">Rule Time</div>
                                        <div class="col-5 q-pr-md">
                                          <q-select
                                            outlined
                                            dense
                                            v-model="undertime_rule.affectedTime"
                                            :options="ruleTimeOptions"
                                            map-options
                                            emit-value
                                          />
                                        </div>
                                        <div class="col-1">from</div>
                                        <div class="col-2 q-pr-md">
                                          <q-input
                                            stack-label
                                            dense
                                            outlined
                                            v-model="undertime_rule.range1"
                                            mask="##:##:##"
                                            configs
                                            :disable="
                                              undertime_rule.affectedTime === 0 ||
                                              undertime_rule.affectedTime === null
                                            "
                                          >
                                            <template v-slot:append>
                                              <q-icon
                                                name="access_time"
                                                class="cursor-pointer"
                                              >
                                                <q-popup-proxy
                                                  cover
                                                  transition-show="scale"
                                                  transition-hide="scale"
                                                >
                                                  <q-time
                                                    v-model="undertime_rule.range1"
                                                    with-seconds
                                                  >
                                                    <div
                                                      class="row items-center justify-end"
                                                    >
                                                      <q-btn
                                                        v-close-popup
                                                        label="Close"
                                                        color="primary"
                                                        flat
                                                      />
                                                    </div>
                                                  </q-time>
                                                </q-popup-proxy>
                                              </q-icon>
                                            </template>
                                          </q-input>
                                        </div>
                                        <div class="col-1">to</div>
                                        <div class="col-2">
                                          <q-input
                                            stack-label
                                            dense
                                            outlined
                                            v-model="undertime_rule.range2"
                                            mask="##:##:##"
                                            :disable="
                                              undertime_rule.affectedTime === 0 ||
                                              undertime_rule.affectedTime === null
                                            "
                                            configs
                                          >
                                            <template v-slot:append>
                                              <q-icon
                                                name="access_time"
                                                class="cursor-pointer"
                                              >
                                                <q-popup-proxy
                                                  cover
                                                  transition-show="scale"
                                                  transition-hide="scale"
                                                >
                                                  <q-time
                                                    v-model="undertime_rule.range2"
                                                    with-seconds
                                                  >
                                                    <div
                                                      class="row items-center justify-end"
                                                    >
                                                      <q-btn
                                                        v-close-popup
                                                        label="Close"
                                                        color="primary"
                                                        flat
                                                      />
                                                    </div>
                                                  </q-time>
                                                </q-popup-proxy>
                                              </q-icon>
                                            </template>
                                          </q-input>
                                        </div>
                                      </div>
                                      <div class="row q-pt-md">
                                        <div class="col-6 q-pa-xs">
                                          <div class="row border-gray q-pa-lg">
                                            <div class="col-5">
                                              <q-checkbox
                                                color="amber-10"
                                                :true-value="1"
                                                :false-value="0"
                                                v-model="
                                                  undertime_rule.undertimeDeduction
                                                "
                                                configs
                                                :disable="
                                                  undertime_rule.multiplierCheck === 1 ||
                                                  undertime_rule.considerAbsent === 1 ||
                                                  undertime_rule.customValueCheck === 1
                                                "
                                                label="No Deductions"
                                              />
                                            </div>
                                            <div class="col-4">
                                              <q-checkbox
                                                color="amber-10"
                                                :true-value="1"
                                                :false-value="0"
                                                value="false"
                                                v-model="undertime_rule.multiplierCheck"
                                                configs
                                                :disable="
                                                  undertime_rule.lateDeduction === 1 ||
                                                  undertime_rule.considerAbsent === 1
                                                "
                                                label="Multiplier Value"
                                              />
                                            </div>
                                            <div class="col-3">
                                              <q-input
                                                outlined
                                                dense
                                                type="number"
                                                placeholder=""
                                                v-model="undertime_rule.multiplier"
                                                configs
                                                :disable="
                                                  undertime_rule.multiplierCheck ===
                                                    null ||
                                                  undertime_rule.multiplierCheck === 0
                                                "
                                              >
                                              </q-input>
                                            </div>
                                          </div>
                                        </div>
                                        <div class="col-6 q-pa-xs">
                                          <div class="row border-gray q-pa-lg">
                                            <div class="col-5">
                                              <q-checkbox
                                                color="amber-10"
                                                value="false"
                                                :true-value="1"
                                                :false-value="0"
                                                v-model="undertime_rule.considerAbsent"
                                                configs
                                                :disable="
                                                  undertime_rule.lateDeduction === 1 ||
                                                  undertime_rule.multiplierCheck === 1 ||
                                                  undertime_rule.customValueCheck === 1
                                                "
                                                label="Consider as Absent"
                                              />
                                            </div>
                                            <div class="col-4">
                                              <q-checkbox
                                                :true-value="1"
                                                :false-value="0"
                                                color="amber-10"
                                                value="false"
                                                v-model="undertime_rule.customValueCheck"
                                                configs
                                                :disable="
                                                  undertime_rule.lateDeduction === 1 ||
                                                  undertime_rule.considerAbsent === 1
                                                "
                                                label="Custom Amount"
                                              />
                                            </div>
                                            <div class="col-3">
                                              <q-input
                                                outlined
                                                dense
                                                type="number"
                                                v-model="undertime_rule.customValue"
                                                configs
                                                :disable="
                                                  undertime_rule.customValueCheck ===
                                                    null ||
                                                  undertime_rule.customValueCheck === 0
                                                "
                                                placeholder=""
                                              >
                                              </q-input>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </div>
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-tab-panel>

            <q-tab-panel name="overbreak">
              <q-btn
                label="Add Overbreak Rule Configuration"
                no-caps
                dense
                outline
                color="amber-10"
                icon="iconfont juanhr-add"
                @click="addSelectedDates('overbreak_rule_date')"
              />
              <div class="col-12">
                <q-list v-if="overbreakRuleDates.length > 0">
                  <q-item
                    v-for="(overbreakDate, index) in overbreakRuleDates"
                    :key="overbreakDate"
                    :id="`${index + 1}`"
                    class="q-mt-md rounded-borders"
                    style="border: 1px solid gray"
                  >
                    <q-item-section>
                      <div class="row">
                        <div class="col-11"></div>
                        <div class="col-1">
                          <q-btn
                            stretch
                            flat
                            round
                            icon="iconfont juanhr-close"
                            color="kahel"
                            style="float: right; border-radius: 50%"
                            @click="overbreakRuleDates.splice(index, 1)"
                          />
                        </div>
                        <div class="col-10 q-pr-md">
                          <small> Selected Date(s) </small>
                          <q-select
                            class="payrollConfig-selected-dates"
                            stack-label
                            dense
                            outlined
                            use-chips
                            multiple
                            fill-input
                            color="kahel"
                            bg-color="white"
                            v-model="overbreak_date[index]"
                          >
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy
                                  ref="qEndDateProxy"
                                  transition-show="scale"
                                  transition-hide="scale"
                                >
                                  <q-date
                                    v-model="overbreak_date[index]"
                                    mask="YYYY-MM-DD"
                                    color="kahel"
                                    :options="optionsFn"
                                    multiple
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-select>
                        </div>

                        <div class="col-2">
                          <small></small>
                          <q-btn
                            class="q-pa-sm"
                            label="Add Schedule Rule"
                            no-caps
                            dense
                            outline
                            color="amber-10"
                            icon="iconfont juanhr-add"
                            @click="addRules('overbreak_rules', overbreakDate.id)"
                          />
                        </div>
                        <div class="col-12">
                          <div v-if="overbreakDate.overbreakConfRules">
                            <q-list v-if="overbreakDate.overbreakConfRules.length">
                              <q-item
                                v-for="(
                                  overbreak_rule, index
                                ) in overbreakDate.overbreakConfRules"
                                :key="overbreak_rule"
                                :id="`${index + 1}`"
                                class="q-mt-md rounded-borders"
                                style="border: 1px solid gray"
                              >
                                <q-item-section>
                                  <div class="row">
                                    <div class="col-11"></div>
                                    <div class="col-1">
                                      <q-btn
                                        stretch
                                        flat
                                        round
                                        icon="iconfont juanhr-close"
                                        color="kahel"
                                        style="float: right; border-radius: 50%"
                                        @click="
                                          overbreakDate.overbreakConfRules.splice(
                                            index,
                                            1
                                          )
                                        "
                                      />
                                    </div>
                                    <div class="col-12">
                                      <div class="row">
                                        <div class="col-1">Rule Time</div>
                                        <div class="col-5 q-pr-md">
                                          <q-select
                                            outlined
                                            dense
                                            v-model="overbreak_rule.affectedTime"
                                            :options="ruleTimeOptions"
                                            map-options
                                            emit-value
                                          />
                                        </div>
                                        <div class="col-1">from</div>
                                        <div class="col-2 q-pr-md">
                                          <q-input
                                            stack-label
                                            dense
                                            outlined
                                            v-model="overbreak_rule.range1"
                                            mask="##:##:##"
                                            configs
                                            :disable="
                                              overbreak_rule.affectedTime === 0 ||
                                              overbreak_rule.affectedTime === null
                                            "
                                          >
                                            <template v-slot:append>
                                              <q-icon
                                                name="access_time"
                                                class="cursor-pointer"
                                              >
                                                <q-popup-proxy
                                                  cover
                                                  transition-show="scale"
                                                  transition-hide="scale"
                                                >
                                                  <q-time
                                                    v-model="overbreak_rule.range1"
                                                    with-seconds
                                                  >
                                                    <div
                                                      class="row items-center justify-end"
                                                    >
                                                      <q-btn
                                                        v-close-popup
                                                        label="Close"
                                                        color="primary"
                                                        flat
                                                      />
                                                    </div>
                                                  </q-time>
                                                </q-popup-proxy>
                                              </q-icon>
                                            </template>
                                          </q-input>
                                        </div>
                                        <div class="col-1">to</div>
                                        <div class="col-2">
                                          <q-input
                                            stack-label
                                            dense
                                            outlined
                                            v-model="overbreak_rule.range2"
                                            mask="##:##:##"
                                            :disable="
                                              overbreak_rule.affectedTime === 0 ||
                                              overbreak_rule.affectedTime === null
                                            "
                                            configs
                                          >
                                            <template v-slot:append>
                                              <q-icon
                                                name="access_time"
                                                class="cursor-pointer"
                                              >
                                                <q-popup-proxy
                                                  cover
                                                  transition-show="scale"
                                                  transition-hide="scale"
                                                >
                                                  <q-time
                                                    v-model="overbreak_rule.range2"
                                                    with-seconds
                                                  >
                                                    <div
                                                      class="row items-center justify-end"
                                                    >
                                                      <q-btn
                                                        v-close-popup
                                                        label="Close"
                                                        color="primary"
                                                        flat
                                                      />
                                                    </div>
                                                  </q-time>
                                                </q-popup-proxy>
                                              </q-icon>
                                            </template>
                                          </q-input>
                                        </div>
                                      </div>
                                      <div class="row q-pt-md">
                                        <div class="col-6 q-pa-xs">
                                          <div class="row border-gray q-pa-lg">
                                            <div class="col-5">
                                              <q-checkbox
                                                color="amber-10"
                                                :true-value="1"
                                                :false-value="0"
                                                v-model="
                                                  overbreak_rule.overbreakDeduction
                                                "
                                                configs
                                                :disable="
                                                  overbreak_rule.multiplierCheck === 1 ||
                                                  overbreak_rule.considerAbsent === 1 ||
                                                  overbreak_rule.customValueCheck === 1
                                                "
                                                label="No Deductions"
                                              />
                                            </div>
                                            <div class="col-4">
                                              <q-checkbox
                                                color="amber-10"
                                                :true-value="1"
                                                :false-value="0"
                                                value="false"
                                                v-model="overbreak_rule.multiplierCheck"
                                                configs
                                                :disable="
                                                  overbreak_rule.overbreakDeduction ===
                                                    1 ||
                                                  overbreak_rule.considerAbsent === 1
                                                "
                                                label="Multiplier Value"
                                              />
                                            </div>
                                            <div class="col-3">
                                              <q-input
                                                outlined
                                                dense
                                                type="number"
                                                placeholder=""
                                                v-model="overbreak_rule.multiplier"
                                                configs
                                                :disable="
                                                  overbreak_rule.multiplierCheck ===
                                                    null ||
                                                  overbreak_rule.multiplierCheck === 0
                                                "
                                              >
                                              </q-input>
                                            </div>
                                          </div>
                                        </div>
                                        <div class="col-6 q-pa-xs">
                                          <div class="row border-gray q-pa-lg">
                                            <div class="col-5">
                                              <q-checkbox
                                                color="amber-10"
                                                value="false"
                                                :true-value="1"
                                                :false-value="0"
                                                v-model="overbreak_rule.considerAbsent"
                                                configs
                                                :disable="
                                                  overbreak_rule.overbreakDeduction ===
                                                    1 ||
                                                  overbreak_rule.multiplierCheck === 1 ||
                                                  overbreak_rule.customValueCheck === 1
                                                "
                                                label="Consider as Absent"
                                              />
                                            </div>
                                            <div class="col-4">
                                              <q-checkbox
                                                :true-value="1"
                                                :false-value="0"
                                                color="amber-10"
                                                value="false"
                                                v-model="overbreak_rule.customValueCheck"
                                                configs
                                                :disable="
                                                  overbreak_rule.overbreakDeduction ===
                                                    1 ||
                                                  overbreak_rule.considerAbsent === 1
                                                "
                                                label="Custom Amount"
                                              />
                                            </div>
                                            <div class="col-3">
                                              <q-input
                                                outlined
                                                dense
                                                type="number"
                                                v-model="overbreak_rule.customValue"
                                                configs
                                                :disable="
                                                  overbreak_rule.customValueCheck ===
                                                    null ||
                                                  overbreak_rule.customValueCheck === 0
                                                "
                                                placeholder=""
                                              >
                                              </q-input>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </div>
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>

      <hr />

      <div class="row justify-end">
        <div class="col-2 q-pa-md">
          <q-btn
            no-caps
            dense
            outline
            class="full-width q-py-xs"
            @click="generatePayroll"
            label="Generate Now"
          />
        </div>
      </div>
      <hr />
    </q-form>

    <q-toolbar>
      <q-toolbar-title> Consolidated Results </q-toolbar-title>
      <q-space />
      <q-btn flat dense round icon="ion-close" :to="{ name: 'payroll' }" />
    </q-toolbar>

    <div class="payroll-consolidated-table">
      <div class="scroll-table q-pa-md">
        <q-table
          :rows="generatedPayrollData"
          table-header-class="bg-amber-8 text-white"
          class="success-consolidated-results"
          :data="generatedPayrollData"
          :columns="columns"
          :dense="$q.screen.lt.md"
          row-key="payroll_id"
          virtual-scroll
          :rows-per-page-options="[0]"
        >
          <template v-slot:bottom="props">
            <q-btn
              flat
              round
              dense
              :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
              @click="props.toggleFullscreen"
              class="q-ml-md"
            />
          </template>
        </q-table>
      </div>

      <div class="q-pa-md">
        <q-table
          table-header-class="bg-amber-8 text-white"
          class="non-success-consolidated-results scroll-table"
          :rows="nonSuccessPayroll"
          :data="nonSuccessPayroll"
          :columns="nonSuccessColumns"
          :dense="$q.screen.lt.md"
          row-key="employee_id"
          virtual-scroll
          :rows-per-page-options="[0]"
        >
          <template v-slot:bottom="props">
            <q-btn
              flat
              round
              dense
              :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
              @click="props.toggleFullscreen"
              class="q-ml-md"
            />
          </template>
        </q-table>
      </div>
    </div>

    <q-inner-loading :showing="triggers.isGeneratingPayroll">
      <q-spinner-pie size="8rem" color="amber-8" />
      <div class="text-h5 q-pt-md">Generating Payroll</div>
      <div class="text-body1 q-pt-md">This may take a while.</div>
    </q-inner-loading>
  </q-scroll-area>
</template>

<script src="./../scripts/Generate.js"></script>
<!--<script src="./../scripts/GeneratePayroll.js"></script>-->

<style lang="scss" scoped>
.generate-payroll-scroll {
  height: calc(100vh - 160px);
}
.payroll-consolidated-table {
  .q-table__container {
    width: calc(100vw - 350px);
  }
}
</style>
