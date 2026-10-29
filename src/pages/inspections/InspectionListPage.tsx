import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../lib/i18nContext';
import { db } from '../../lib/supabase';
import {
  Inspection,
  InspectionItem,
  CheckpointResult,
  CorrectiveAction,
  CompanyMember,
  ActionPriority,
  ActionStatus
} from '../../types';
import {
  ClipboardCheck,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  AlertTriangle,
  Play,
  FileCheck2,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  CheckSquare,
  ShieldAlert,
  User,
  Save,
  CheckCircle,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { Toast, ToastMessage } from '../../components/common/Toast';

const COMPREHENSIVE_CHECKLIST_TEMPLATES: Record<
  string,
  { category: string; item_text: string; item_text_ar: string }[]
> = {
  'Scaffold Safety & Working at Heights': [
    {
      category: 'Scaffolding Foundation',
      item_text: 'Base plates, mudsills, and screw jacks level and firm on solid ground',
      item_text_ar: 'ألواح القواعد ومثبتات المسامير مستوية ومثبتة على أرضية صلبة'
    },
    {
      category: 'Fall Protection',
      item_text: 'Guardrails (top rail 42", mid rail 21") and toe boards fully installed',
      item_text_ar: 'درابزينات الحماية العلوية والمتوسطة وحواجز الأقدام مركبة بالكامل'
    },
    {
      category: 'Access & Ladder',
      item_text: 'Safe ladder access secured and extending 1 meter above working landing',
      item_text_ar: 'سلم الصعود مؤمن ومثبت ويمتد متراً واحداً فوق منصة العمل'
    },
    {
      category: 'Inspection Tag',
      item_text: 'Green Scafftag signed by certified Aramco/NEOM scaffolding supervisor',
      item_text_ar: 'بطاقة السقالات الخضراء معتمدة وموقعة من المشرف المعتمد'
    }
  ],
  'Heavy Lifting & Crane Operation': [
    {
      category: 'Crane Certification',
      item_text: 'Valid third-party inspection certificate (TÜV / Bureau Veritas) displayed in cab',
      item_text_ar: 'شهادة فحص طرف ثالث سارية المفعول معلقة في كابينة المشغل'
    },
    {
      category: 'Rigging Gear',
      item_text: 'Slings, shackles, and wire ropes color-coded for current month and undamaged',
      item_text_ar: 'أحزمة الرفع والأقفال مرمزة باللون المعتمد للشهر وخالية من التلف'
    },
    {
      category: 'Lift Plan & Exclusion Zone',
      item_text: 'Critical lift plan approved and swing radius barricaded with safety tape',
      item_text_ar: 'خطة الرفع الحرجة معتمدة ومنطقة دوران الرافعة مطوقة بشريط التحذير'
    },
    {
      category: 'Ground Conditions',
      item_text: 'Outriggers fully extended on solid timber pads with stable ground compaction',
      item_text_ar: 'ركائز الرافعة ممتدة بالكامل على وسائد خشبية مع ثبات دمك التربة'
    }
  ],
  'Trench & Excavation Safety': [
    {
      category: 'Shoring & Sloping',
      item_text: 'Excavations deeper than 1.2m shored with hydraulic braces or sloped properly',
      item_text_ar: 'الحفريات التي تزيد عن 1.2م مدعومة بالستائر أو مدرجة بزوايا آمنة'
    },
    {
      category: 'Access & Egress',
      item_text: 'Ladders placed every 7.5 meters and extending 1 meter above excavation lip',
      item_text_ar: 'سلالم الخروج موزعة كل 7.5 متر وتمتد متراً واحداً فوق حافة الحفرية'
    },
    {
      category: 'Spoil Pile Clearance',
      item_text: 'Excavated spoil and heavy machinery kept at least 1 meter away from edge',
      item_text_ar: 'أكوام نواتج الحفر والآليات الثقيلة تبعد متراً واحداً على الأقل عن الحافة'
    },
    {
      category: 'Atmospheric Testing',
      item_text: 'Gas test completed for H2S and oxygen levels in deep confined excavation',
      item_text_ar: 'فحص الغازات (H2S ونسبة الأكسجين) مكتمل ومعتمد في الحفريات المحصورة'
    }
  ],
  'Electrical Equipment & Grounding': [
    {
      category: 'Cables & Distribution',
      item_text: 'Industrial power cables elevated on insulated stands and free from joints/cuts',
      item_text_ar: 'كابلات التغذية الصناعية مرفوعة على حوامل معزولة وخالية من الوصلات'
    },
    {
      category: 'Earth Leakage (GFCI)',
      item_text: 'All distribution panels equipped with functioning 30mA residual current breakers',
      item_text_ar: 'جميع لوحات التوزيع مزودة بقواطع تسريب أرضي حساسة 30 ملي أمبير'
    },
    {
      category: 'Panel Enclosure',
      item_text: 'Electrical panels weatherproofed, locked, and marked with warning signs',
      item_text_ar: 'لوحات الكهرباء معزولة ضد العوامل الجوية ومقفلة وعليها علامات التحذير'
    }
  ],
  'Fire Safety & Hot Work Management': [
    {
      category: 'Hot Work Permit',
      item_text: 'Valid Hot Work Permit posted at location with designated fire watcher on duty',
      item_text_ar: 'تصريح الأعمال الساخنة ساري ومعلق مع وجود مراقب حريق مخصص'
    },
    {
      category: 'Fire Extinguishers',
      item_text: 'Inspected dry chemical fire extinguishers stationed within 10 meters',
      item_text_ar: 'طفايات حريق بودرة كيميائية مفحوصة وسارية على بعد أقل من 10 أمتار'
    },
    {
      category: 'Combustible Clearance',
      item_text: 'Flammable materials removed or covered with fire-resistant welding blankets',
      item_text_ar: 'المواد القابلة للاشتعال مبعدة أو مغطاة ببطانيات اللحام المقاومة للحريق'
    }
  ],
  'PPE & Site Housekeeping Standards': [
    {
      category: 'Mandatory PPE',
      item_text: 'All workforce wearing certified hard hat, safety glasses, high-vis vest, and steel boots',
      item_text_ar: 'التزام كافة القوى العاملة بالخوذة والنظارات والسترة العاكسة وحذاء السلامة'
    },
    {
      category: 'Access Walkways',
      item_text: 'Main pedestrian walkways clearly demarcated, illuminated, and free of trip hazards',
      item_text_ar: 'ممرات المشاة محددة بوضوح ومضاءة وخالية من عوائق التعثر'
    },
    {
      category: 'Waste Management',
      item_text: 'Color-coded waste skips available and hazardous chemical waste segregated',
      item_text_ar: 'حاويات النفايات المرمزة متوفرة مع عزل النفايات الكيميائية الخطرة'
    }
  ]
};

export const InspectionListPage: React.FC = () => {
  const { selectedSiteId, can, sites, user } = useAuth();
  const { t, isRtl, formatDate } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Main Tab: 'inspections' vs 'actions'
  const [activeModuleTab, setActiveModuleTab] = useState<'inspections' | 'actions'>(
    (searchParams.get('tab') as 'inspections' | 'actions') || 'inspections'
  );

  // Inspections State
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [inspectionFilter, setInspectionFilter] = useState<string>('all');
  const [inspectionSearch, setInspectionSearch] = useState('');

  // Corrective Actions State
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [actionPriorityFilter, setActionPriorityFilter] = useState<string>('all');
  const [actionSearch, setActionSearch] = useState('');

  // Team members for inspector selection
  const [teamMembers, setTeamMembers] = useState<CompanyMember[]>([]);

  // Loading & Toast State
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Pagination State
  const [inspectionsPage, setInspectionsPage] = useState(1);
  const [actionsPage, setActionsPage] = useState(1);
  const pageSize = 9;

  // Schedule Inspection Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [title, setTitle] = useState('Weekly HSE Compliance Inspection');
  const [inspectionType, setInspectionType] = useState('Scaffold Safety & Working at Heights');
  const [targetSiteId, setTargetSiteId] = useState(sites[0]?.id || '');
  const [inspectorId, setInspectorId] = useState(user?.id || '');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleError, setScheduleError] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Execution Modal State
  const [activeExecutionInspection, setActiveExecutionInspection] = useState<Inspection | null>(null);
  const [checklistItems, setChecklistItems] = useState<InspectionItem[]>([]);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [executionError, setExecutionError] = useState('');
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);

  // Custom Checkpoint in Execution State
  const [isAddingCustomItem, setIsAddingCustomItem] = useState(false);
  const [customCategory, setCustomCategory] = useState('General Safety');
  const [customText, setCustomText] = useState('');
  const [customTextAr, setCustomTextAr] = useState('');

  // Resolve Action Modal State
  const [resolvingAction, setResolvingAction] = useState<CorrectiveAction | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolveError, setResolveError] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Create Manual Action Modal State
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDescription, setNewActionDescription] = useState('');
  const [newActionPriority, setNewActionPriority] = useState<ActionPriority>('high');
  const [newActionDueDate, setNewActionDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [createActionError, setCreateActionError] = useState('');
  const [isCreatingAction, setIsCreatingAction] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [insList, actList, members] = await Promise.all([
        db.getInspections(selectedSiteId),
        db.getCorrectiveActions(selectedSiteId),
        db.getTeamMembers()
      ]);
      setInspections(insList);
      setActions(actList);
      setTeamMembers(members);
      if (members.length > 0 && !inspectorId) {
        setInspectorId(members[0].user_id || members[0].user?.id || user?.id || '');
      }
    } catch (err: unknown) {
      console.error('Failed to load inspection data:', err);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err instanceof Error ? err.message : t('errorGeneric')
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return unsub;
  }, [selectedSiteId]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'actions' || tabParam === 'inspections') {
      setActiveModuleTab(tabParam);
    }
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      if (tabParam === 'actions') {
        setActionFilter(filterParam);
      } else {
        setInspectionFilter(filterParam);
      }
    }
    if (searchParams.get('action') === 'new' && can('manage_inspections')) {
      handleOpenScheduleModal();
    }
  }, [searchParams]);

  // Handle Tab Switch
  const handleTabSwitch = (tab: 'inspections' | 'actions') => {
    setActiveModuleTab(tab);
    searchParams.set('tab', tab);
    setSearchParams(searchParams);
  };

  const handleOpenScheduleModal = () => {
    setTitle(isRtl ? 'فحص السلامة والصحة المهنية الأسبوعي' : 'Weekly HSE Compliance Inspection');
    setInspectionType('Scaffold Safety & Working at Heights');
    setTargetSiteId(sites[0]?.id || '');
    setInspectorId(user?.id || '');
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setScheduleError('');
    setIsScheduleModalOpen(true);
  };

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError('');

    if (!title || !inspectionType || !targetSiteId || !scheduledDate) {
      setScheduleError(t('requiredField'));
      return;
    }

    setIsScheduling(true);
    try {
      const company = await db.getCompany();
      const templateItems = COMPREHENSIVE_CHECKLIST_TEMPLATES[inspectionType] || [
        {
          category: 'General Safety',
          item_text: 'Site PPE standards enforced and compliant',
          item_text_ar: 'معدات الوقاية الشخصية مطابقة ومستخدمة بالكامل'
        }
      ];

      const newInspectionItems: InspectionItem[] = templateItems.map((item, idx) => ({
        id: 'item-' + Date.now().toString(36) + '-' + idx,
        inspection_id: '',
        category: item.category,
        item_text: item.item_text,
        item_text_ar: item.item_text_ar,
        result: 'pass',
        sort_order: idx + 1
      }));

      await db.createInspection({
        company_id: company.id,
        site_id: targetSiteId,
        title,
        inspection_type: inspectionType,
        inspector_id: inspectorId || user?.id,
        scheduled_date: scheduledDate,
        status: 'draft',
        items: newInspectionItems
      });

      setIsScheduleModalOpen(false);
      searchParams.delete('action');
      setSearchParams(searchParams);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: isRtl ? 'تمت جدولة الفحص الميداني بنجاح.' : 'Safety inspection scheduled successfully.'
      });
      await loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setScheduleError(err.message);
      } else {
        setScheduleError(t('errorGeneric'));
      }
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDeleteInspection = async (id: string, inspTitle: string) => {
    if (!can('manage_inspections')) return;
    if (window.confirm(`${t('confirmDelete')}\n\n${inspTitle}`)) {
      try {
        await db.deleteInspection(id);
        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: isRtl ? 'تم حذف سجل الفحص بنجاح.' : 'Inspection record removed.'
        });
        await loadData();
      } catch (err: unknown) {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          message: err instanceof Error ? err.message : t('errorGeneric')
        });
      }
    }
  };

  const handleOpenExecution = (ins: Inspection) => {
    setActiveExecutionInspection(ins);
    setChecklistItems(
      ins.items && ins.items.length > 0
        ? ins.items
        : [
            {
              id: 'item-1',
              inspection_id: ins.id,
              category: 'Site Safety Rules',
              item_text: 'Workers wearing mandatory PPE (Hardhat, High-vis, Steel toe boots)',
              item_text_ar: 'التزام العمال بمعدات الوقاية الإلزامية (الخوذة، السترة العاكسة، حذاء السلامة)',
              result: 'pass',
              sort_order: 1
            },
            {
              id: 'item-2',
              inspection_id: ins.id,
              category: 'Access & Gate Interlock',
              item_text: 'Turnstile gate check verified with zero uncertified personnel on site',
              item_text_ar: 'التحقق من بوابات الدخول وعدم وجود أي عمال بدون شهادات معتمدة',
              result: 'pass',
              sort_order: 2
            }
          ]
    );
    setSummaryNotes(ins.summary_notes || '');
    setExecutionError('');
    setIsAddingCustomItem(false);
  };

  const handleItemResultChange = (itemId: string, result: CheckpointResult) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, result } : item))
    );
  };

  const handleItemNotesChange = (itemId: string, notes: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  // Add Custom Checkpoint
  const handleAddCustomCheckpoint = () => {
    if (!customText.trim()) return;
    const newItem: InspectionItem = {
      id: 'custom-' + Date.now().toString(36),
      inspection_id: activeExecutionInspection?.id || '',
      category: customCategory.trim() || 'General Safety',
      item_text: customText.trim(),
      item_text_ar: customTextAr.trim() || customText.trim(),
      result: 'pass',
      sort_order: checklistItems.length + 1
    };
    setChecklistItems((prev) => [...prev, newItem]);
    setCustomText('');
    setCustomTextAr('');
    setIsAddingCustomItem(false);
  };

  // Save Draft (can be partial)
  const handleSaveDraft = async () => {
    if (!activeExecutionInspection) return;
    try {
      await db.saveDraftInspection(activeExecutionInspection.id, checklistItems, summaryNotes);
      setActiveExecutionInspection(null);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: t('draftSaved')
      });
      await loadData();
    } catch (err: unknown) {
      console.error(err);
      setExecutionError(t('errorGeneric'));
    }
  };

  // Sign & Complete Audit
  const handleSubmitCompletedAudit = async () => {
    if (!activeExecutionInspection) return;

    // Check if any checkpoint item has missing result
    const hasUnanswered = checklistItems.some((item) => !item.result);
    if (hasUnanswered) {
      setExecutionError(t('allAnsweredRequired'));
      return;
    }

    setIsSubmittingAudit(true);
    try {
      await db.completeInspection(activeExecutionInspection.id, checklistItems, summaryNotes);
      setActiveExecutionInspection(null);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: t('inspectionCompleted')
      });
      await loadData();
    } catch (err: unknown) {
      console.error(err);
      setExecutionError(t('errorGeneric'));
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  // Resolve Corrective Action Handler
  const handleExecuteResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingAction || !resolutionNotes.trim()) {
      setResolveError(t('requiredField'));
      return;
    }

    setIsResolving(true);
    try {
      await db.resolveCorrectiveAction(
        resolvingAction.id,
        resolutionNotes,
        user?.full_name || 'HSE Manager'
      );
      setResolvingAction(null);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: t('actionResolved')
      });
      await loadData();
    } catch (err: unknown) {
      setResolveError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setIsResolving(false);
    }
  };

  // Manual Corrective Action Handler
  const handleCreateManualAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim() || !newActionDueDate) {
      setCreateActionError(t('requiredField'));
      return;
    }

    setIsCreatingAction(true);
    try {
      const company = await db.getCompany();
      await db.createCorrectiveAction({
        company_id: company.id,
        title: newActionTitle.trim(),
        description: newActionDescription.trim() || 'Manual corrective action recorded by HSE supervisor.',
        priority: newActionPriority,
        status: 'open',
        assigned_to: user?.id,
        due_date: newActionDueDate
      });

      setIsCreateActionModalOpen(false);
      setNewActionTitle('');
      setNewActionDescription('');
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: isRtl ? 'تم تسجيل الإجراء التصحيحي بنجاح.' : 'Corrective action created successfully.'
      });
      await loadData();
    } catch (err: unknown) {
      setCreateActionError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setIsCreatingAction(false);
    }
  };

  // Delete Corrective Action
  const handleDeleteAction = async (id: string, actionTitle: string) => {
    if (!can('manage_inspections')) return;
    if (window.confirm(`${t('confirmDelete')}\n\n${actionTitle}`)) {
      try {
        await db.deleteCorrectiveAction(id);
        setToast({
          id: Date.now().toString(),
          type: 'success',
          message: isRtl ? 'تم حذف الإجراء التصحيحي.' : 'Action removed.'
        });
        await loadData();
      } catch (err: unknown) {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          message: err instanceof Error ? err.message : t('errorGeneric')
        });
      }
    }
  };

  // Filtered Inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter((ins) => {
      // Text search
      const query = inspectionSearch.toLowerCase().trim();
      if (query) {
        const titleMatch =
          ins.title.toLowerCase().includes(query) ||
          (ins.title_ar && ins.title_ar.toLowerCase().includes(query));
        const typeMatch = ins.inspection_type.toLowerCase().includes(query);
        const siteMatch = ins.site?.name.toLowerCase().includes(query);
        const notesMatch = ins.summary_notes?.toLowerCase().includes(query);
        if (!titleMatch && !typeMatch && !siteMatch && !notesMatch) return false;
      }

      // Tab/Status Filter
      const isCompleted = ins.status === 'completed_pass' || ins.status === 'completed_fail';
      const scheduledDateObj = new Date(ins.scheduled_date);
      const isOverdue = !isCompleted && scheduledDateObj < new Date();

      if (inspectionFilter === 'overdue') return isOverdue;
      if (inspectionFilter === 'draft') return ins.status === 'draft';
      if (inspectionFilter === 'in_progress') return ins.status === 'in_progress' || ins.status === 'draft';
      if (inspectionFilter === 'completed_pass') return ins.status === 'completed_pass';
      if (inspectionFilter === 'completed_fail') return ins.status === 'completed_fail';

      return true;
    });
  }, [inspections, inspectionSearch, inspectionFilter]);

  // Filtered Corrective Actions
  const filteredActions = useMemo(() => {
    return actions.filter((act) => {
      // Search
      const query = actionSearch.toLowerCase().trim();
      if (query) {
        const titleMatch =
          act.title.toLowerCase().includes(query) ||
          (act.title_ar && act.title_ar.toLowerCase().includes(query));
        const descMatch = act.description?.toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }

      // Priority Filter
      if (actionPriorityFilter !== 'all' && act.priority !== actionPriorityFilter) {
        return false;
      }

      // Status Filter
      const isOverdue =
        act.status !== 'resolved' &&
        act.status !== 'verified_closed' &&
        new Date(act.due_date) < new Date();

      if (actionFilter === 'overdue') return isOverdue;
      if (actionFilter === 'open') return act.status === 'open';
      if (actionFilter === 'in_progress') return act.status === 'in_progress';
      if (actionFilter === 'resolved')
        return act.status === 'resolved' || act.status === 'verified_closed';

      return true;
    });
  }, [actions, actionSearch, actionPriorityFilter, actionFilter]);

  // Paginated slices
  const paginatedInspections = useMemo(() => {
    const start = (inspectionsPage - 1) * pageSize;
    return filteredInspections.slice(start, start + pageSize);
  }, [filteredInspections, inspectionsPage, pageSize]);

  const paginatedActions = useMemo(() => {
    const start = (actionsPage - 1) * pageSize;
    return filteredActions.slice(start, start + pageSize);
  }, [filteredActions, actionsPage, pageSize]);

  // Quick Counts
  const countOverdueInspections = inspections.filter((i) => {
    const isCompleted = i.status === 'completed_pass' || i.status === 'completed_fail';
    return !isCompleted && new Date(i.scheduled_date) < new Date();
  }).length;

  const countOpenActions = actions.filter(
    (a) => a.status === 'open' || a.status === 'in_progress'
  ).length;

  const countOverdueActions = actions.filter((a) => {
    const isClosed = a.status === 'resolved' || a.status === 'verified_closed';
    return !isClosed && new Date(a.due_date) < new Date();
  }).length;

  return (
    <div className="space-y-5">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B3A] tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-[#168C82]" />
            <span>{t('inspectionsTitle')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            {isRtl
              ? 'جدولة الفحوصات الميدانية، قوائم تدقيق السلامة، ومتابعة إغلاق الإجراءات التصحيحية'
              : 'Digital safety audits, checklist verification, and corrective action remediation'}
          </p>
        </div>

        {can('manage_inspections') && (
          <div className="flex items-center gap-2">
            {activeModuleTab === 'inspections' ? (
              <button
                onClick={handleOpenScheduleModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#16324F] text-white text-xs font-bold hover:bg-[#0F2236] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{t('scheduleInspection')}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCreateActionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#168C82] text-white text-xs font-bold hover:bg-[#116e66] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{isRtl ? 'إضافة إجراء تصحيحي' : 'New Corrective Action'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Top Module Tabs (Inspections vs Corrective Actions) */}
      <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-2 text-xs font-bold">
        <button
          onClick={() => handleTabSwitch('inspections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeModuleTab === 'inspections'
              ? 'bg-[#16324F] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>{t('tabInspections')}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
            {inspections.length}
          </span>
          {countOverdueInspections > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {countOverdueInspections}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabSwitch('actions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            activeModuleTab === 'actions'
              ? 'bg-[#16324F] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-[#F2B544]" />
          <span>{t('tabActions')}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
            {actions.length}
          </span>
          {countOverdueActions > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {countOverdueActions} {isRtl ? 'متأخر' : 'overdue'}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: SAFETY INSPECTIONS */}
      {activeModuleTab === 'inspections' && (
        <div className="space-y-4">
          {/* Sub-Filters & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={inspectionSearch}
                onChange={(e) => {
                  setInspectionSearch(e.target.value);
                  setInspectionsPage(1);
                }}
                placeholder={
                  isRtl
                    ? 'البحث في الفحوصات بالعنوان، الموقع، أو نوع الفحص...'
                    : 'Search audits by title, site, or inspection category...'
                }
                className="block w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setInspectionFilter('all')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  inspectionFilter === 'all'
                    ? 'bg-[#16324F] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t('all')} ({inspections.length})
              </button>
              <button
                onClick={() => setInspectionFilter('in_progress')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  inspectionFilter === 'in_progress'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {t('statusDraft')}
              </button>
              <button
                onClick={() => setInspectionFilter('completed_pass')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  inspectionFilter === 'completed_pass'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {t('statusCompletedPass')}
              </button>
              <button
                onClick={() => setInspectionFilter('completed_fail')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  inspectionFilter === 'completed_fail'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                {t('statusCompletedFail')}
              </button>
              <button
                onClick={() => setInspectionFilter('overdue')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  inspectionFilter === 'overdue'
                    ? 'bg-rose-700 text-white'
                    : 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                }`}
              >
                {t('statusOverdue')} ({countOverdueInspections})
              </button>
            </div>
          </div>

          {/* Inspections Grid */}
          {isLoading ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#168C82]" />
              <span>{t('loading')}</span>
            </div>
          ) : filteredInspections.length === 0 ? (
            <EmptyState
              title={t('noRecords')}
              description={
                isRtl
                  ? 'لا توجد فحوصات سلامة مسجلة تطابق معايير التصفية المحددة.'
                  : 'No safety inspections found for the active filter.'
              }
              icon={ClipboardCheck}
              actionText={can('manage_inspections') ? t('scheduleInspection') : undefined}
              onAction={can('manage_inspections') ? handleOpenScheduleModal : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedInspections.map((ins) => {
                const isCompleted =
                  ins.status === 'completed_pass' || ins.status === 'completed_fail';
                const scheduledDateObj = new Date(ins.scheduled_date);
                const isOverdue = !isCompleted && scheduledDateObj < new Date();
                const failItemsCount = ins.items?.filter((i) => i.result === 'fail').length || 0;

                return (
                  <div
                    key={ins.id}
                    className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold text-[#168C82] uppercase tracking-wider line-clamp-1">
                          {ins.inspection_type}
                        </span>
                        <StatusBadge
                          status={isOverdue ? 'overdue' : ins.status}
                          size="sm"
                        />
                      </div>

                      <h3 className="text-sm font-bold text-[#172B3A] line-clamp-2">
                        {isRtl && ins.title_ar ? ins.title_ar : ins.title}
                      </h3>

                      <div className="mt-3 space-y-1.5 text-xs text-[#64748B]">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {ins.site
                              ? isRtl && ins.site.name_ar
                                ? ins.site.name_ar
                                : ins.site.name
                              : '-'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(ins.scheduled_date)}</span>
                        </div>

                        {ins.inspector && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {ins.inspector.full_name} ({t('inspector')})
                            </span>
                          </div>
                        )}
                      </div>

                      {ins.summary_notes && (
                        <p className="mt-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700 italic line-clamp-2">
                          &ldquo;{ins.summary_notes}&rdquo;
                        </p>
                      )}

                      {failItemsCount > 0 && (
                        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>
                            {failItemsCount} {t('findingsCount')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {ins.items?.length || 0} {isRtl ? 'عناصر تدقيق' : 'checkpoints'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenExecution(ins)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isCompleted
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'bg-[#168C82] text-white hover:bg-[#116e66] shadow-sm'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'عرض النتائج' : 'View Results'}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'تنفيذ القائمة' : 'Execute Checklist'}</span>
                            </>
                          )}
                        </button>

                        {can('manage_inspections') && (
                          <button
                            onClick={() => handleDeleteInspection(ins.id, ins.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={inspectionsPage}
            totalItems={filteredInspections.length}
            pageSize={pageSize}
            onPageChange={setInspectionsPage}
          />
        </div>
      )}

      {/* TAB 2: CORRECTIVE ACTIONS (CAPA) */}
      {activeModuleTab === 'actions' && (
        <div className="space-y-4">
          {/* Sub-Filters & Priority Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={actionSearch}
                onChange={(e) => {
                  setActionSearch(e.target.value);
                  setActionsPage(1);
                }}
                placeholder={
                  isRtl
                    ? 'البحث في الإجراءات التصحيحية بالعنوان أو الوصف...'
                    : 'Search corrective actions by title or description...'
                }
                className="block w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
              {/* Priority Dropdown */}
              <select
                value={actionPriorityFilter}
                onChange={(e) => {
                  setActionPriorityFilter(e.target.value);
                  setActionsPage(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-slate-50 text-slate-700 focus:outline-none"
              >
                <option value="all">{isRtl ? 'جميع درجات الخطورة' : 'All Severities'}</option>
                <option value="critical">{t('priorityCritical')}</option>
                <option value="high">{t('priorityHigh')}</option>
                <option value="medium">{t('priorityMedium')}</option>
                <option value="low">{t('priorityLow')}</option>
              </select>

              {/* Status Pills */}
              <button
                onClick={() => setActionFilter('all')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  actionFilter === 'all'
                    ? 'bg-[#16324F] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t('all')} ({actions.length})
              </button>
              <button
                onClick={() => setActionFilter('open')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  actionFilter === 'open'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {t('statusOpen')} ({actions.filter((a) => a.status === 'open').length})
              </button>
              <button
                onClick={() => setActionFilter('resolved')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  actionFilter === 'resolved'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {t('statusResolved')}
              </button>
              <button
                onClick={() => setActionFilter('overdue')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  actionFilter === 'overdue'
                    ? 'bg-rose-700 text-white'
                    : 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                }`}
              >
                {t('overdueBadge')} ({countOverdueActions})
              </button>
            </div>
          </div>

          {/* Corrective Actions Table */}
          {isLoading ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#168C82]" />
              <span>{t('loading')}</span>
            </div>
          ) : filteredActions.length === 0 ? (
            <EmptyState
              title={t('noRecords')}
              description={
                isRtl
                  ? 'لا توجد إجراءات تصحيحية مسجلة لهذا التصنيف.'
                  : 'No corrective action items found for this criteria.'
              }
              icon={AlertTriangle}
              actionText={can('manage_inspections') ? (isRtl ? 'إضافة إجراء تصحيحي' : 'New Action') : undefined}
              onAction={can('manage_inspections') ? () => setIsCreateActionModalOpen(true) : undefined}
            />
          ) : (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      <th className="py-3 px-4">{t('actionTitle')}</th>
                      <th className="py-3 px-4">{t('actionPriority')}</th>
                      <th className="py-3 px-4">{t('actionDueDate')}</th>
                      <th className="py-3 px-4">{t('status')}</th>
                      <th className="py-3 px-4">{t('actionAssignee')}</th>
                      <th className="py-3 px-4 text-end">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {paginatedActions.map((act) => {
                      const isClosed = act.status === 'resolved' || act.status === 'verified_closed';
                      const isOverdue = !isClosed && new Date(act.due_date) < new Date();

                      return (
                        <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-bold text-[#172B3A]">
                                {isRtl && act.title_ar ? act.title_ar : act.title}
                              </p>
                              {act.description && (
                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                  {act.description}
                                </p>
                              )}
                              {act.resolution_notes && (
                                <p className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                                  ✓ {isRtl ? 'تم الحل: ' : 'Resolved: '} {act.resolution_notes}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <StatusBadge status={act.priority} size="sm" />
                          </td>

                          <td className="py-3.5 px-4">
                            <div>
                              <span className={`font-semibold ${isOverdue ? 'text-rose-700' : 'text-slate-700'}`}>
                                {formatDate(act.due_date)}
                              </span>
                              {isOverdue && (
                                <span className="block text-[10px] font-bold text-rose-600">
                                  {t('overdueBadge')}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <StatusBadge status={act.status} size="sm" />
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            {act.assignee?.full_name || 'HSE Officer'}
                          </td>

                          <td className="py-3.5 px-4 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isClosed && can('manage_inspections') && (
                                <button
                                  onClick={() => {
                                    setResolvingAction(act);
                                    setResolutionNotes('');
                                    setResolveError('');
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
                                  title={t('resolveAction')}
                                >
                                  <CheckSquare className="w-3.5 h-3.5" />
                                  <span>{t('resolveAction')}</span>
                                </button>
                              )}

                              {can('manage_inspections') && (
                                <button
                                  onClick={() => handleDeleteAction(act.id, act.title)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                  title={t('delete')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Actions Pagination */}
              <Pagination
                currentPage={actionsPage}
                totalItems={filteredActions.length}
                pageSize={pageSize}
                onPageChange={setActionsPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Schedule Inspection Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={t('scheduleInspection')}
        subtitle={
          isRtl
            ? 'تحديد موقع وتاريخ ونوع فحص السلامة الميداني واختيار المفتش المسؤول'
            : 'Select inspection type, project site, assigned auditor, and scheduled date'
        }
        maxWidth="lg"
      >
        <form onSubmit={handleCreateInspection} className="space-y-4">
          {scheduleError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scheduleError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {isRtl ? 'عنوان الفحص الميداني *' : 'Inspection Title *'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('inspectionType')} *
            </label>
            <select
              value={inspectionType}
              onChange={(e) => setInspectionType(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-white font-medium"
            >
              {Object.keys(COMPREHENSIVE_CHECKLIST_TEMPLATES).map((tmplKey) => (
                <option key={tmplKey} value={tmplKey}>
                  {tmplKey}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('assignedSite')} *
              </label>
              <select
                value={targetSiteId}
                onChange={(e) => setTargetSiteId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-white"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isRtl && s.name_ar ? s.name_ar : s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('inspector')} *
              </label>
              <select
                value={inspectorId}
                onChange={(e) => setInspectorId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-white"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.user_id || m.id}>
                    {m.user?.full_name || m.invited_email} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('scheduledDate')} *
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
            </div>
          </div>

          {/* Checklist Preview Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-[#168C82] uppercase tracking-wider block">
              {isRtl ? 'معاينة بنود التحقق التلقائية للقالب المعتمد' : 'Pre-configured Inspection Checkpoints'}
            </span>
            <div className="space-y-1">
              {(COMPREHENSIVE_CHECKLIST_TEMPLATES[inspectionType] || []).map((cp, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckSquare className="w-3.5 h-3.5 text-[#168C82] shrink-0" />
                  <span className="font-semibold text-slate-500">[{cp.category}]</span>
                  <span className="truncate">{isRtl ? cp.item_text_ar : cp.item_text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isScheduling}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#16324F] hover:bg-[#0F2236] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isScheduling && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isRtl ? 'جدولة وتثبيت الفحص' : 'Schedule Audit'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Checklist Execution Modal */}
      <Modal
        isOpen={!!activeExecutionInspection}
        onClose={() => setActiveExecutionInspection(null)}
        title={
          activeExecutionInspection
            ? isRtl && activeExecutionInspection.title_ar
              ? activeExecutionInspection.title_ar
              : activeExecutionInspection.title
            : t('checklistItems')
        }
        subtitle={`${t('assignedSite')}: ${
          activeExecutionInspection?.site
            ? isRtl && activeExecutionInspection.site.name_ar
              ? activeExecutionInspection.site.name_ar
              : activeExecutionInspection.site.name
            : '-'
        }`}
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {executionError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{executionError}</span>
            </div>
          )}

          {/* Checklist Items list */}
          <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
            {checklistItems.map((item, index) => {
              const isFail = item.result === 'fail';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isFail
                      ? 'bg-rose-50/50 border-rose-300'
                      : 'bg-white border-[#E2E8F0] shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#168C82] block mb-1">
                        {item.category}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-[#172B3A]">
                        {index + 1}. {isRtl && item.item_text_ar ? item.item_text_ar : item.item_text}
                      </p>
                    </div>

                    {/* Radio Result Toggles (Pass / Fail / NA) */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleItemResultChange(item.id, 'pass')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          item.result === 'pass'
                            ? 'bg-[#168C82] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t('pass')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleItemResultChange(item.id, 'fail')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          item.result === 'fail'
                            ? 'bg-[#C83E4D] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t('fail')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleItemResultChange(item.id, 'na')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          item.result === 'na'
                            ? 'bg-slate-400 text-white'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {t('na')}
                      </button>
                    </div>
                  </div>

                  {/* Notes & Finding Input if Fail */}
                  {isFail && (
                    <div className="mt-3 pt-3 border-t border-rose-200 space-y-1.5">
                      <label className="block text-[11px] font-bold text-rose-800">
                        {isRtl
                          ? '⚠️ تفاصيل المخالفة (سيتم إنشاء إجراء تصحيحي CAPA تلقائياً):'
                          : '⚠️ Defect observation details (Will generate Corrective Action):'}
                      </label>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => handleItemNotesChange(item.id, e.target.value)}
                        placeholder={
                          isRtl
                            ? 'مثال: وجود ميول جانبي في الدعامة يتطلب إعادة تثبيت فوري...'
                            : 'e.g., Damaged sling found, missing safety pin on shackle'
                        }
                        className="w-full px-3 py-1.5 text-xs border border-rose-300 rounded-lg bg-white focus:ring-2 focus:ring-rose-500 font-medium"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Custom Checkpoint Section */}
          {can('manage_inspections') && (
            <div className="pt-2">
              {!isAddingCustomItem ? (
                <button
                  type="button"
                  onClick={() => setIsAddingCustomItem(true)}
                  className="text-xs font-bold text-[#168C82] hover:text-[#116e66] flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addCustomCheckpoint')}</span>
                </button>
              ) : (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#16324F]">{t('addCustomCheckpoint')}</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomItem(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder={t('checkpointCategory') + ' (e.g. Scaffolding, Electrical)'}
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      placeholder={t('checkpointText') + ' (English)'}
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={t('checkpointText') + ' (العربية)'}
                    value={customTextAr}
                    onChange={(e) => setCustomTextAr(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomItem(false)}
                      className="px-3 py-1 text-xs text-slate-600"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomCheckpoint}
                      className="px-3.5 py-1 text-xs font-bold text-white bg-[#168C82] rounded-lg shadow-2xs"
                    >
                      {t('add')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inspector Summary Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {isRtl ? 'الملاحظات والملخص الختامي للمفتش' : 'Inspector Summary & Auditor Observations'}
            </label>
            <textarea
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              rows={2}
              placeholder={
                isRtl
                  ? 'ملخص نتائج الفحص الميداني وتوصيات السلامة...'
                  : 'Overall audit observations and instructions for site engineers...'
              }
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
            />
          </div>

          {/* Footer Controls: Draft vs Complete */}
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setActiveExecutionInspection(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 w-full sm:w-auto text-center"
            >
              {t('cancel')}
            </button>

            {can('manage_inspections') && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 flex-1 sm:flex-none"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('saveDraft')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitCompletedAudit}
                  disabled={isSubmittingAudit}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#168C82] hover:bg-[#116e66] rounded-lg transition-colors shadow-md disabled:opacity-50 flex-1 sm:flex-none"
                >
                  {isSubmittingAudit ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{isRtl ? 'التوقيع واعتماد الفحص' : 'Sign & Complete Audit'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Resolve Corrective Action Modal */}
      <Modal
        isOpen={!!resolvingAction}
        onClose={() => setResolvingAction(null)}
        title={t('resolveAction')}
        subtitle={resolvingAction ? (isRtl && resolvingAction.title_ar ? resolvingAction.title_ar : resolvingAction.title) : ''}
        maxWidth="md"
      >
        <form onSubmit={handleExecuteResolution} className="space-y-4">
          {resolveError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {resolveError}
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">{t('actionPriority')}:</span>
              <StatusBadge status={resolvingAction?.priority || 'high'} size="sm" />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('actionDueDate')}:</span>
              <span className="font-semibold text-slate-700">{formatDate(resolvingAction?.due_date)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('resolutionNotes')} *
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              required
              rows={3}
              placeholder={
                isRtl
                  ? 'سجل الإجراءات التي تم اتخاذها بالميدان لإصلاح الخلل وإغلاق الملاحظة...'
                  : 'Document physical corrective actions implemented on site...'
              }
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setResolvingAction(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isResolving}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isResolving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{t('resolveAction')}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Manual Action Modal */}
      <Modal
        isOpen={isCreateActionModalOpen}
        onClose={() => setIsCreateActionModalOpen(false)}
        title={isRtl ? 'تسجيل إجراء تصحيحي جديد' : 'New Corrective Action'}
        subtitle={
          isRtl
            ? 'توثيق ملاحظة أو خلل ميداني وتعيين المسؤول وتاريخ المعالجة'
            : 'Record a safety finding and assign responsible engineer'
        }
        maxWidth="md"
      >
        <form onSubmit={handleCreateManualAction} className="space-y-4">
          {createActionError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {createActionError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {t('actionTitle')} *
            </label>
            <input
              type="text"
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              required
              placeholder="e.g. Replace worn wire rope on Crane #4"
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172B3A] mb-1">
              {isRtl ? 'تفاصيل الملاحظة' : 'Description / Hazard Details'}
            </label>
            <textarea
              value={newActionDescription}
              onChange={(e) => setNewActionDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('actionPriority')} *
              </label>
              <select
                value={newActionPriority}
                onChange={(e) => setNewActionPriority(e.target.value as ActionPriority)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] bg-white font-medium"
              >
                <option value="critical">{t('priorityCritical')}</option>
                <option value="high">{t('priorityHigh')}</option>
                <option value="medium">{t('priorityMedium')}</option>
                <option value="low">{t('priorityLow')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('actionDueDate')} *
              </label>
              <input
                type="date"
                value={newActionDueDate}
                onChange={(e) => setNewActionDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateActionModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isCreatingAction}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#168C82] hover:bg-[#116e66] rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isCreatingAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{t('save')}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
