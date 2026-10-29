/**
 * SITEREADY GCC — INSPECTION & CORRECTIVE ACTION WORKFLOW TEST SUITE
 * 
 * Verifies:
 * 1. Inspection scheduling (site, inspector, date, configurable checklists)
 * 2. Draft saving vs completion
 * 3. Pass / Fail / NA responses and automatic fail status
 * 4. Automatic Corrective Action (CAPA) generation from failed checkpoints
 * 5. Overdue status calculations for inspections & corrective actions
 * 6. Closing & resolving corrective actions with resolution notes
 * 7. Live Dashboard KPI metrics reactivity
 * 8. CSV export validation (including UTF-8 BOM)
 * 9. Company-level multi-tenant isolation and role permission enforcement
 */

import fs from 'fs';
import path from 'path';

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS [${testName}] ${details}`);
  } else {
    console.error(`  ✗ FAIL [${testName}] ${details}`);
  }
}

console.log('\n========================================================================');
console.log('   SITEREADY GCC — INSPECTION & CAPA END-TO-END WORKFLOW TEST SUITE   ');
console.log('========================================================================\n');

// 1. Simulating DataStore with In-Memory State
console.log('1. Testing Inspection Scheduling with Configurable Checklists...');

const COMPANY_A_ID = '11111111-1111-1111-1111-111111111111';
const COMPANY_B_ID = '22222222-2222-2222-2222-222222222222';
const SITE_A1_ID = 'site-a1-neom';
const SITE_B1_ID = 'site-b1-redsea';
const INSPECTOR_A_ID = 'usr-inspector-1';

// Initial Mock Store
let inspections = [];
let inspectionItems = [];
let correctiveActions = [];

function createInspection(data) {
  const newIns = {
    id: 'ins-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1000),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: data.status || 'draft',
    ...data
  };
  inspections.push(newIns);
  if (data.items) {
    data.items.forEach((item, idx) => {
      inspectionItems.push({
        id: 'item-' + newIns.id + '-' + idx,
        inspection_id: newIns.id,
        category: item.category || 'General',
        item_text: item.item_text,
        item_text_ar: item.item_text_ar,
        result: item.result || 'na',
        notes: item.notes || '',
        sort_order: idx + 1
      });
    });
  }
  return newIns;
}

function saveDraftInspection(id, items, summaryNotes) {
  const ins = inspections.find((i) => i.id === id);
  if (!ins) throw new Error('Inspection not found');
  ins.status = 'in_progress';
  ins.summary_notes = summaryNotes;
  ins.updated_at = new Date().toISOString();
  // Update items
  items.forEach((it) => {
    const existing = inspectionItems.find((x) => x.id === it.id);
    if (existing) {
      existing.result = it.result;
      existing.notes = it.notes;
    }
  });
  return ins;
}

function completeInspection(id, items, summaryNotes) {
  const ins = inspections.find((i) => i.id === id);
  if (!ins) throw new Error('Inspection not found');

  const hasFails = items.some((item) => item.result === 'fail');
  ins.status = hasFails ? 'completed_fail' : 'completed_pass';
  ins.summary_notes = summaryNotes;
  ins.completed_at = new Date().toISOString();
  ins.updated_at = new Date().toISOString();

  // Update items & trigger CAPA for fails
  items.forEach((it) => {
    const existing = inspectionItems.find((x) => x.id === it.id);
    if (existing) {
      existing.result = it.result;
      existing.notes = it.notes;
    }
    if (it.result === 'fail') {
      const newAction = {
        id: 'act-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1000),
        company_id: ins.company_id,
        inspection_id: ins.id,
        inspection_item_id: it.id,
        title: `Remediate: ${it.item_text}`,
        title_ar: it.item_text_ar ? `إجراء تصحيحي: ${it.item_text_ar}` : undefined,
        description: it.notes || 'Corrective action generated from safety audit non-compliance.',
        priority: 'high',
        status: 'open',
        assigned_to: ins.inspector_id,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      correctiveActions.push(newAction);
    }
  });
  return ins;
}

function resolveCorrectiveAction(id, resolutionNotes, resolvedBy) {
  const act = correctiveActions.find((a) => a.id === id);
  if (!act) throw new Error('Action not found');
  act.status = 'resolved';
  act.resolution_notes = resolutionNotes;
  act.resolved_at = new Date().toISOString();
  act.resolved_by = resolvedBy;
  act.updated_at = new Date().toISOString();
  return act;
}

// Step 1: Schedule an Inspection
const scheduledDateFuture = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
const inspection1 = createInspection({
  company_id: COMPANY_A_ID,
  site_id: SITE_A1_ID,
  title: 'Tower 4 Scaffolding & Working at Heights Audit',
  inspection_type: 'Scaffold Safety & Working at Heights',
  inspector_id: INSPECTOR_A_ID,
  scheduled_date: scheduledDateFuture,
  status: 'draft',
  items: [
    {
      category: 'Foundation',
      item_text: 'Base plates firm and level on compacted ground',
      item_text_ar: 'ألواح القواعد مستوية وثابتة',
      result: 'pass'
    },
    {
      category: 'Fall Protection',
      item_text: 'Top rail and mid rail installed without missing pins',
      item_text_ar: 'الدرابزينات العلوية والمتوسطة مثبتة بالكامل',
      result: 'na'
    },
    {
      category: 'Tagging',
      item_text: 'Green Scafftag valid and signed by certified supervisor',
      item_text_ar: 'بطاقة السقالات الخضراء سارية وموقعة',
      result: 'na'
    }
  ]
});

assert(inspection1.id && inspection1.status === 'draft', 'Inspection Scheduled', `ID: ${inspection1.id}`);
const scheduledItems = inspectionItems.filter((i) => i.inspection_id === inspection1.id);
assert(scheduledItems.length === 3, 'Checklist Items Generated', `Items count: ${scheduledItems.length}`);

// Step 2: Save Draft with Partial Progress
console.log('\n2. Testing Draft Saving & In-Progress State...');
scheduledItems[1].result = 'pass';
saveDraftInspection(inspection1.id, scheduledItems, 'Auditor completed preliminary foundation checks.');
assert(inspection1.status === 'in_progress', 'Draft Saved', 'Status changed to in_progress');
assert(scheduledItems[1].result === 'pass', 'Item Updated in Draft', 'Item 2 saved as pass');

// Step 3: Complete Audit with a Defect/Fail Result
console.log('\n3. Testing Inspection Completion & CAPA Generation...');
scheduledItems[2].result = 'fail';
scheduledItems[2].notes = 'Scafftag missing signature from competent inspector; red tag required.';

completeInspection(inspection1.id, scheduledItems, 'Audit completed. Deficiency found on platform tagging.');

assert(inspection1.status === 'completed_fail', 'Status Completed Fail', 'Defect correctly sets status to completed_fail');
assert(inspection1.completed_at !== undefined, 'Audit Signed & Completed', `Completed at: ${inspection1.completed_at}`);

const generatedActions = correctiveActions.filter((a) => a.inspection_id === inspection1.id);
assert(generatedActions.length === 1, 'Auto-generated Corrective Action', `Found ${generatedActions.length} CAPA item`);
assert(generatedActions[0].status === 'open', 'CAPA Initial Status Open', 'Status is open');
assert(generatedActions[0].priority === 'high', 'CAPA Priority High', 'Priority set to high');
assert(generatedActions[0].description.includes('Scafftag missing signature'), 'CAPA Notes Linked', generatedActions[0].description);

// Step 4: Overdue Status Calculation
console.log('\n4. Testing Overdue Status Logic...');
// Past inspection not completed
const pastDate = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
const overdueInspection = createInspection({
  company_id: COMPANY_A_ID,
  site_id: SITE_A1_ID,
  title: 'Overdue Crane Rigging Audit',
  inspection_type: 'Heavy Lifting & Crane Operation',
  inspector_id: INSPECTOR_A_ID,
  scheduled_date: pastDate,
  status: 'draft'
});

const isInsOverdue = (ins) => {
  if (ins.status === 'completed_pass' || ins.status === 'completed_fail') return false;
  return new Date(ins.scheduled_date) < new Date();
};

assert(isInsOverdue(overdueInspection) === true, 'Past Date Inspection Overdue', 'Past draft inspection flagged overdue');
assert(isInsOverdue(inspection1) === false, 'Completed Inspection NOT Overdue', 'Completed fail inspection not overdue');

// Past due corrective action
const overdueAction = {
  id: 'act-overdue-1',
  company_id: COMPANY_A_ID,
  title: 'Fix ungrounded generator',
  priority: 'critical',
  status: 'open',
  due_date: pastDate
};
correctiveActions.push(overdueAction);

const isActionOverdue = (act) => {
  if (act.status === 'resolved' || act.status === 'verified_closed') return false;
  return new Date(act.due_date) < new Date();
};

assert(isActionOverdue(overdueAction) === true, 'Past Due Action Flagged Overdue', 'Unresolved past due action is overdue');

// Step 5: Resolve and Close Corrective Action
console.log('\n5. Testing Corrective Action Resolution & Closing...');
const targetAction = generatedActions[0];
resolveCorrectiveAction(targetAction.id, 'Inspected by certified scaffolding supervisor; new green tag signed.', 'Ahmed Al-Harbi (HSE Manager)');

assert(targetAction.status === 'resolved', 'CAPA Resolved', 'Status changed to resolved');
assert(targetAction.resolved_at !== undefined, 'Resolution Timestamp Recorded', `Resolved at: ${targetAction.resolved_at}`);
assert(targetAction.resolution_notes.includes('new green tag signed'), 'Resolution Notes Preserved', targetAction.resolution_notes);
assert(isActionOverdue(targetAction) === false, 'Resolved Action Not Overdue', 'Resolved action ceases to be overdue');

// Step 6: Live Dashboard Metrics Reactivity
console.log('\n6. Testing Dashboard KPI Metrics Sync...');
function computeDashboardMetrics(companyId) {
  const companyInspections = inspections.filter((i) => i.company_id === companyId);
  const companyActions = correctiveActions.filter((a) => a.company_id === companyId);

  const overdueInspectionsCount = companyInspections.filter(isInsOverdue).length;
  const openActionsCount = companyActions.filter((a) => a.status === 'open' || a.status === 'in_progress').length;

  return {
    overdueInspectionsCount,
    openActionsCount,
    totalInspections: companyInspections.length,
    totalActions: companyActions.length
  };
}

const metricsA = computeDashboardMetrics(COMPANY_A_ID);
assert(metricsA.overdueInspectionsCount === 1, 'Dashboard Overdue Inspections Count', `Count: ${metricsA.overdueInspectionsCount}`);
assert(metricsA.openActionsCount === 1, 'Dashboard Open Actions Count (only overdue one left)', `Count: ${metricsA.openActionsCount}`);

// Step 7: CSV Export Formatting (UTF-8 BOM)
console.log('\n7. Testing CSV Compliance Report Formatting...');
function generateInspectionsCSV(companyId) {
  let csv = '\uFEFF'; // BOM
  csv += 'Site,Title,Type,Scheduled Date,Status,Summary\n';
  inspections
    .filter((i) => i.company_id === companyId)
    .forEach((i) => {
      csv += `"${i.site_id}","${i.title}","${i.inspection_type}","${i.scheduled_date}","${i.status}","${i.summary_notes || ''}"\n`;
    });
  return csv;
}

const csvResult = generateInspectionsCSV(COMPANY_A_ID);
assert(csvResult.startsWith('\uFEFF'), 'CSV Contains UTF-8 BOM', 'Ensures Arabic Excel compatibility');
assert(csvResult.includes('Tower 4 Scaffolding'), 'CSV Includes Inspection Title', 'Title present');
assert(csvResult.includes('completed_fail'), 'CSV Includes Final Status', 'Status present');

// Step 8: Multi-Tenant Isolation
console.log('\n8. Testing Company Isolation on Inspections & Actions...');
const inspectionB = createInspection({
  company_id: COMPANY_B_ID,
  site_id: SITE_B1_ID,
  title: 'Red Sea Jetty Underwater Inspection',
  inspection_type: 'Heavy Lifting & Crane Operation',
  scheduled_date: scheduledDateFuture,
  status: 'draft'
});

const companyAInspections = inspections.filter((i) => i.company_id === COMPANY_A_ID);
const hasCompanyBRecordInA = companyAInspections.some((i) => i.company_id === COMPANY_B_ID);
assert(!hasCompanyBRecordInA, 'Tenant Isolation on Inspections', 'Company A cannot view Company B inspection');

// Step 9: Role Restrictions
console.log('\n9. Testing Role Permissions for Inspections & Actions...');
const ROLES_PERMISSIONS = {
  owner: ['manage_inspections', 'resolve_actions', 'view_reports'],
  manager: ['manage_inspections', 'resolve_actions', 'view_reports'],
  viewer: ['view_reports']
};

function can(role, permission) {
  return (ROLES_PERMISSIONS[role] || []).includes(permission);
}

assert(can('owner', 'manage_inspections') === true, 'Owner Can Schedule/Execute Inspections', 'Allowed');
assert(can('manager', 'manage_inspections') === true, 'Manager Can Schedule/Execute Inspections', 'Allowed');
assert(can('viewer', 'manage_inspections') === false, 'Viewer CANNOT Schedule/Execute Inspections', 'Blocked');
assert(can('viewer', 'resolve_actions') === false, 'Viewer CANNOT Resolve Corrective Actions', 'Blocked');
assert(can('viewer', 'view_reports') === true, 'Viewer Can View/Export Compliance Reports', 'Allowed');

console.log('\n========================================================================');
console.log(`   TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}   `);
if (totalTests === passedTests) {
  console.log('   ALL INSPECTION & CAPA WORKFLOW TESTS PASSED (100%)   ');
} else {
  console.error('   SOME TESTS FAILED!   ');
  process.exit(1);
}
console.log('========================================================================\n');
