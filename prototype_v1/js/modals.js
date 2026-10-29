/**
 * SiteReady GCC — Interactive Modals, Drawers & Security Pass Dialogs
 */

const Modals = {
  // 1. Add Employee Modal
  openAddEmployee() {
    const isAr = store.locale === 'ar';
    const container = document.getElementById('modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001D37]/60 backdrop-blur-xs animate-fade-in" onclick="Modals.close(event)">
        <div class="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-lg overflow-hidden flex flex-col" onclick="event.stopPropagation()">
          <!-- Header -->
          <div class="p-5 bg-[#001D37] text-white flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-[#168C82] flex items-center justify-center">
                <span class="material-symbols-outlined text-[18px]">person_add</span>
              </div>
              <div class="flex flex-col text-start">
                <h3 class="text-[16px] font-bold">${store.t('modalAddEmployeeTitle')}</h3>
                <span class="text-[11px] text-[#90f4e8] font-mono">Qiwa & Muqeem KSA Gateway</span>
              </div>
            </div>
            <button onclick="Modals.close()" class="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Form Body -->
          <form onsubmit="Modals.submitAddEmployee(event)" class="p-6 flex flex-col gap-4 text-start">
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-[#172B3A]">${store.t('lblFullNameEn')} *</label>
                <input id="new-worker-name-en" type="text" required placeholder="e.g. Faisal Al-Shehri" class="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[13px] text-[#172B3A] focus:ring-2 focus:ring-[#16324F]/20 outline-none"/>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-[#172B3A]">${store.t('lblFullNameAr')} *</label>
                <input id="new-worker-name-ar" type="text" required placeholder="مثال: فيصل الشهري" class="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[13px] text-[#172B3A] focus:ring-2 focus:ring-[#16324F]/20 outline-none"/>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-[#172B3A]">${store.t('lblIqama')} *</label>
                <input id="new-worker-iqama" type="text" pattern="[1-2][0-9]{9}" required placeholder="10-digit ID (e.g. 1092849182)" class="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[13px] font-mono text-[#172B3A] focus:ring-2 focus:ring-[#16324F]/20 outline-none"/>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-[#172B3A]">${store.t('lblNationality')} *</label>
                <select id="new-worker-nat" class="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[13px] text-[#172B3A] focus:ring-2 focus:ring-[#16324F]/20 outline-none bg-white">
                  <option value="Saudi Arabian">Saudi Arabian (سعودي)</option>
                  <option value="Pakistani">Pakistani (باكستاني)</option>
                  <option value="Indian">Indian (هندي)</option>
                  <option value="Jordanian">Jordanian (أردني)</option>
                  <option value="Egyptian">Egyptian (مصري)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-[#172B3A]">${store.t('lblTrade')} *</label>
                <input id="new-worker-trade" type="text" required placeholder="e.g. Certified Crane Signaler" class="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[13px] text-[#172B3A] focus:ring-2 focus:ring-[#16324F]/20 outline-none"/>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-[#172B3A]">${store.t('lblSubcontractor')} *</label>
                <select id="new-worker-sc" class="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[13px] text-[#172B3A] focus:ring-2 focus:ring-[#16324F]/20 outline-none bg-white">
                  ${store.subcontractors.map(sc => `<option value="${sc.id}">${sc.nameEn}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-bold text-[#172B3A]">${store.t('lblCertType')}</label>
              <input id="new-worker-cert" type="text" placeholder="e.g. Aramco Safety Induction & Working at Heights" class="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[13px] text-[#172B3A] focus:ring-2 focus:ring-[#16324F]/20 outline-none"/>
            </div>

            <!-- Buttons -->
            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
              <button type="button" onclick="Modals.close()" class="px-4 py-2 rounded-xl border border-[#CBD5E1] hover:bg-[#F5F7FA] text-[#172B3A] text-[13px] font-bold">
                ${store.t('btnCancel')}
              </button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-[#168C82] hover:bg-[#12726a] text-white text-[13px] font-bold shadow-sm transition-all active:scale-98">
                ${store.t('btnSaveSubmit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  submitAddEmployee(e) {
    e.preventDefault();
    const nameEn = document.getElementById('new-worker-name-en').value;
    const nameAr = document.getElementById('new-worker-name-ar').value;
    const iqama = document.getElementById('new-worker-iqama').value;
    const nationality = document.getElementById('new-worker-nat').value;
    const tradeEn = document.getElementById('new-worker-trade').value;
    const subcontractorId = document.getElementById('new-worker-sc').value;
    const certNameEn = document.getElementById('new-worker-cert').value;

    store.addWorker({
      nameEn,
      nameAr,
      iqama,
      nationality,
      tradeEn,
      tradeAr: nameAr ? tradeEn : tradeEn,
      subcontractorId,
      certNameEn: certNameEn || "Civil Defense OHS Induction"
    });

    Modals.close();
  },

  // 2. Add Certificate Modal
  openAddCertificate(targetWorkerId = null) {
    const isAr = store.locale === 'ar';
    const container = document.getElementById('modal-container');
    if (!container) return;

    const workerId = targetWorkerId || store.selectedWorkerId;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001D37]/60 backdrop-blur-xs animate-fade-in" onclick="Modals.close(event)">
        <div class="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-lg overflow-hidden flex flex-col" onclick="event.stopPropagation()">
          <div class="p-5 bg-[#001D37] text-white flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-[#168C82] flex items-center justify-center">
                <span class="material-symbols-outlined text-[18px]">workspace_premium</span>
              </div>
              <div class="flex flex-col text-start">
                <h3 class="text-[16px] font-bold">${store.t('modalAddCertTitle')}</h3>
                <span class="text-[11px] text-[#90f4e8]">Saudi Aramco & TÜV Vetted Credentials</span>
              </div>
            </div>
            <button onclick="Modals.close()" class="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onsubmit="Modals.submitAddCertificate(event, '${workerId}')" class="p-6 flex flex-col gap-4 text-start">
            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-bold text-[#172B3A]">Assign To Worker *</label>
              <select id="cert-worker-id" class="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[13px] text-[#172B3A] focus:ring-2 focus:ring-[#16324F]/20 outline-none bg-white">
                ${store.workers.map(w => `<option value="${w.id}" ${w.id === workerId ? 'selected' : ''}>${w.nameEn} (${w.id} - ${w.iqama})</option>`).join('')}
              </select>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-[11px] font-bold text-[#172B3A]">Certificate / Qualification Name *</label>
              <select id="cert-name-select" class="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[13px] text-[#172B3A] focus:ring-2 focus:ring-[#16324F]/20 outline-none bg-white">
                <option value="Saudi Aramco Rigging Specialist Level 1">Saudi Aramco Rigging Specialist Level 1</option>
                <option value="TÜV Rheinland Heavy Crane Signaling">TÜV Rheinland Heavy Crane Signaling</option>
                <option value="SEC High-Voltage Authorized Electrical Person (AEP)">SEC High-Voltage Authorized Electrical Person (AEP)</option>
                <option value="CISRS Advanced Scaffolding Inspector Level 3">CISRS Advanced Scaffolding Inspector Level 3</option>
                <option value="NEBOSH International General Certificate (IGC)">NEBOSH International General Certificate (IGC)</option>
                <option value="Civil Defense Fire Safety Marshal (Code 998)">Civil Defense Fire Safety Marshal (Code 998)</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-[#172B3A]">${store.t('lblCertNo')} *</label>
                <input id="cert-license-no" type="text" required value="SA-RGL-${Math.floor(1000 + Math.random() * 9000)}-KSA" class="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[13px] font-mono text-[#172B3A] focus:ring-2 focus:ring-[#16324F]/20 outline-none"/>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-[#172B3A]">${store.t('lblExpiryDate')} *</label>
                <input id="cert-expiry-date" type="date" required value="2027-06-30" class="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-[13px] text-[#172B3A] focus:ring-2 focus:ring-[#16324F]/20 outline-none bg-white"/>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
              <button type="button" onclick="Modals.close()" class="px-4 py-2 rounded-xl border border-[#CBD5E1] text-[#172B3A] text-[13px] font-bold">
                ${store.t('btnCancel')}
              </button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-[#168C82] hover:bg-[#12726a] text-white text-[13px] font-bold shadow-sm transition-all active:scale-98">
                Verify & Register
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  submitAddCertificate(e, fallbackWorkerId) {
    e.preventDefault();
    const workerId = document.getElementById('cert-worker-id') ? document.getElementById('cert-worker-id').value : fallbackWorkerId;
    const nameEn = document.getElementById('cert-name-select').value;
    const licenseNo = document.getElementById('cert-license-no').value;
    const expiryDate = document.getElementById('cert-expiry-date').value;

    store.addCertificate(workerId, {
      nameEn,
      licenseNo,
      expiryDate,
      issueDate: "2024-10-01"
    });

    Modals.close();
  },

  // 3. HSE Gate Lockout Resolver Modal
  openLockoutResolver() {
    const isAr = store.locale === 'ar';
    const container = document.getElementById('modal-container');
    if (!container) return;

    const barredWorkers = store.workers.filter(w => w.gateStatus === 'barred');

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001D37]/70 backdrop-blur-xs animate-fade-in" onclick="Modals.close(event)">
        <div class="bg-white rounded-2xl shadow-2xl border border-[#F7B5BC] w-full max-w-2xl overflow-hidden flex flex-col" onclick="event.stopPropagation()">
          <!-- Header -->
          <div class="p-5 bg-[#C83E4D] text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white text-[#C83E4D] flex items-center justify-center shadow-xs">
                <span class="material-symbols-outlined text-[22px]">gpp_bad</span>
              </div>
              <div class="flex flex-col text-start">
                <h3 class="text-[17px] font-bold">${store.t('modalLockoutTitle')}</h3>
                <span class="text-[11px] text-white/90">Site Gate 04 • Turnstile B Interlock Triggered</span>
              </div>
            </div>
            <button onclick="Modals.close()" class="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 flex flex-col gap-4 text-start max-h-[75vh] overflow-y-auto">
            <div class="p-3.5 rounded-xl bg-[#FDECEE] border border-[#F7B5BC] text-[12px] text-[#172B3A]">
              <span class="font-bold text-[#C83E4D] block mb-0.5">Automated Biometric Security Action Taken:</span>
              <span>Turnstiles deactivated at 00:00 AST. Access prevented to NEOM Substation Beta and heavy crane bays due to safety regulatory expiration under Saudi Civil Code Sec. 14.</span>
            </div>

            <h4 class="text-[14px] font-bold text-[#172B3A]">${isAr ? 'قائمة الأفراد المحظورين عند البوابة' : 'Barred Personnel Roster'}</h4>

            <div class="flex flex-col gap-3">
              ${barredWorkers.length === 0 ? `
                <div class="p-8 text-center bg-[#E6F5F3] text-[#168C82] rounded-xl font-bold">
                  All turnstiles cleared! Zero active lockouts.
                </div>
              ` : barredWorkers.map(w => `
                <div class="p-4 rounded-xl bg-[#F8F9FF] border border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div class="flex items-start gap-3">
                    <img src="${w.photoUrl}" alt="${w.nameEn}" class="w-11 h-11 rounded-full object-cover border border-[#CBD5E1] shrink-0"/>
                    <div class="flex flex-col">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-[#172B3A] text-[14px]">${isAr ? w.nameAr : w.nameEn}</span>
                        <span class="font-mono text-[10px] text-[#C83E4D] font-bold bg-[#FDECEE] px-1.5 py-0.5 rounded">HOLD</span>
                      </div>
                      <span class="text-[11px] text-[#64748B]">${isAr ? w.tradeAr : w.tradeEn} • Iqama: ${w.iqama}</span>
                      <span class="text-[11px] text-[#C83E4D] font-bold mt-1">${isAr ? w.validThroughTextAr : w.validThroughTextEn}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <button onclick="store.resolveLockout('${w.id}'); Modals.close();" class="px-3.5 py-2 rounded-xl bg-[#168C82] hover:bg-[#12726a] text-white text-[12px] font-bold shadow-xs transition-all active:scale-98">
                      ${isAr ? 'اعتماد فتح استثنائي (30 يوم)' : 'Clear & Grant 30d Grace'}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <span class="text-[11px] text-[#64748B]">Authorization logged under Eng. Tariq Al-Otaibi (HSE Director)</span>
              <button onclick="Modals.close()" class="px-4 py-2 rounded-xl bg-[#16324F] text-white text-[12px] font-bold">
                ${store.t('btnDismiss')}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 4. Digital QR Gate Pass Modal (Authentic Printable Security Badge)
  openQrGatePass(workerId) {
    const isAr = store.locale === 'ar';
    const container = document.getElementById('modal-container');
    if (!container) return;

    const worker = store.workers.find(w => w.id === workerId) || store.workers[0];

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001D37]/75 backdrop-blur-xs animate-fade-in" onclick="Modals.close(event)">
        <div class="bg-white rounded-3xl shadow-2xl border border-white/20 w-full max-w-sm overflow-hidden flex flex-col" onclick="event.stopPropagation()">
          <!-- Physical Badge Simulator Header -->
          <div id="printable-pass" class="p-6 bg-gradient-to-b from-[#001D37] via-[#16324F] to-[#0F2236] text-white flex flex-col items-center text-center relative overflow-hidden">
            <!-- Lanyard Slot Clip -->
            <div class="w-14 h-3 rounded-full bg-black/40 mb-3 mx-auto border border-white/20 shadow-inner"></div>

            <!-- Top Authority Logo & Pass Type -->
            <div class="flex items-center justify-between w-full px-2 mb-3">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[#90f4e8] text-[20px]">verified_user</span>
                <span class="text-[12px] font-bold uppercase tracking-wider text-white">SiteReady GCC</span>
              </div>
              <span class="font-mono text-[10px] bg-[#168C82] text-white px-2 py-0.5 rounded-full font-bold">NFC ACTIVE</span>
            </div>

            <!-- Worker Photo with Hologram ring -->
            <div class="relative my-2">
              <div class="w-28 h-28 rounded-full p-1 hologram-seal shadow-lg">
                <img src="${worker.photoUrl}" alt="${worker.nameEn}" class="w-full h-full rounded-full object-cover border-2 border-white"/>
              </div>
              <div class="absolute bottom-0 right-1 bg-[#168C82] text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md">
                <span class="material-symbols-outlined text-[16px]">verified</span>
              </div>
            </div>

            <!-- Name and Trade -->
            <h2 class="text-[18px] font-bold text-white mt-1 leading-snug">${worker.nameEn}</h2>
            <span class="text-[14px] text-white/80">${worker.nameAr}</span>
            <span class="text-[12px] text-[#90f4e8] font-bold mt-1">${worker.tradeEn}</span>
            <span class="text-[11px] text-white/70">${worker.subcontractorNameEn}</span>

            <!-- Official Matrix Ribbon -->
            <div class="w-full bg-white/10 backdrop-blur-md rounded-2xl p-3 my-3 text-start grid grid-cols-2 gap-2 text-[11px] font-mono border border-white/10">
              <div>
                <span class="text-[9px] uppercase font-bold text-white/60 block">Iqama ID</span>
                <span class="font-bold text-white">${worker.iqama}</span>
              </div>
              <div>
                <span class="text-[9px] uppercase font-bold text-white/60 block">Pass Serial</span>
                <span class="font-bold text-[#90f4e8]">${worker.passSerial}</span>
              </div>
              <div>
                <span class="text-[9px] uppercase font-bold text-white/60 block">Project Site</span>
                <span class="font-bold text-white truncate max-w-[120px]">${worker.siteNameEn}</span>
              </div>
              <div>
                <span class="text-[9px] uppercase font-bold text-white/60 block">Expiry</span>
                <span class="font-bold text-white">${worker.expiryDate}</span>
              </div>
            </div>

            <!-- Scannable High-Contrast QR Code -->
            <div class="bg-white p-3 rounded-2xl shadow-md my-1 flex flex-col items-center">
              <!-- SVG QR Pattern -->
              <svg class="w-32 h-32" viewBox="0 0 100 100" fill="#001D37">
                <rect width="100" height="100" fill="#FFFFFF"/>
                <path d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M19,19 h7 v7 h-7 z"/>
                <path d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M74,19 h7 v7 h-7 z"/>
                <path d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M19,74 h7 v7 h-7 z"/>
                <circle cx="50" cy="50" r="10" fill="#168C82"/>
                <rect x="45" y="15" width="10" height="20" fill="#001D37"/>
                <rect x="40" y="70" width="20" height="10" fill="#001D37"/>
                <rect x="70" y="45" width="15" height="10" fill="#001D37"/>
                <rect x="15" y="45" width="15" height="10" fill="#001D37"/>
                <rect x="70" y="70" width="15" height="15" fill="#001D37"/>
              </svg>
              <span class="font-mono text-[9px] text-[#172B3A] font-bold tracking-widest mt-1">NFC GATE-04 BIOMETRIC CLEAR</span>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="p-4 bg-white flex items-center justify-between gap-2 border-t border-[#E2E8F0]">
            <button onclick="window.print()" class="flex-1 py-2.5 rounded-xl bg-[#16324F] hover:bg-[#0F2236] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-sm">
              <span class="material-symbols-outlined text-[16px]">print</span>
              <span>${store.t('btnPrintPass')}</span>
            </button>
            <button onclick="store.showToast('${isAr ? 'تم إرسال بطاقة التصريح عبر تطبيق واتساب بنجاح' : 'Dispatched NFC pass credentials to worker via WhatsApp'}', 'success')" class="flex-1 py-2.5 rounded-xl bg-[#168C82] hover:bg-[#12726a] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-sm">
              <span class="material-symbols-outlined text-[16px]">send</span>
              <span>WhatsApp</span>
            </button>
            <button onclick="Modals.close()" class="w-10 h-10 rounded-xl bg-[#F5F7FA] hover:bg-[#E2E8F0] text-[#172B3A] flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // 5. Simulated QR / Barcode Scanner Modal
  openQrScanner() {
    const isAr = store.locale === 'ar';
    const container = document.getElementById('modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onclick="Modals.close(event)">
        <div class="bg-[#001D37] text-white rounded-3xl shadow-2xl border border-white/20 w-full max-w-sm overflow-hidden flex flex-col relative" onclick="event.stopPropagation()">
          <!-- Camera Viewfinder Simulation -->
          <div class="relative h-80 bg-[#0F2236] flex items-center justify-center overflow-hidden scanner-grid">
            <!-- Animated laser line -->
            <div class="scanner-laser absolute left-4 right-4 h-0.5 bg-[#168C82] shadow-[0_0_12px_#168C82]"></div>

            <!-- Target corners -->
            <div class="w-56 h-56 border-2 border-dashed border-[#168C82]/80 rounded-2xl relative flex items-center justify-center">
              <span class="text-[11px] font-mono text-[#90f4e8] bg-[#001D37]/80 px-2 py-1 rounded">ALIGN PASS QR CODE</span>
            </div>

            <!-- Close icon -->
            <button onclick="Modals.close()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="p-5 flex flex-col gap-3 text-center">
            <h3 class="text-[16px] font-bold text-white">Biometric QR Gate Reader</h3>
            <p class="text-[12px] text-[#809abd]">Point camera at worker gate badge or NFC tag to verify live Qiwa credentials.</p>

            <button onclick="Modals.simulateSuccessfulScan()" class="w-full py-3 rounded-xl bg-[#168C82] hover:bg-[#12726a] text-white text-[13px] font-bold shadow-md flex items-center justify-center gap-2 active:scale-98 transition-transform">
              <span class="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>Simulate Scan: Mohammad Salem</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  simulateSuccessfulScan() {
    Modals.close();
    store.setSelectedWorker('SR-8921');
    store.setMobileTab('profile');
    store.showToast('BEEP! Verified Mohammad Salem (SR-8921) — Gate Cleared (Green)', 'success');
  },

  // 6. Inspection Checklist Execution Modal
  openInspectionChecklist(inspectionId) {
    const isAr = store.locale === 'ar';
    const container = document.getElementById('modal-container');
    if (!container) return;

    const ins = store.inspections.find(i => i.id === inspectionId) || store.inspections[0];

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001D37]/70 backdrop-blur-xs animate-fade-in" onclick="Modals.close(event)">
        <div class="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-lg overflow-hidden flex flex-col" onclick="event.stopPropagation()">
          <div class="p-5 bg-[#001D37] text-white flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-[#90f4e8] text-[22px]">fact_check</span>
              <div class="flex flex-col text-start">
                <h3 class="text-[15px] font-bold">${isAr ? ins.titleAr : ins.titleEn}</h3>
                <span class="font-mono text-[11px] text-[#90f4e8]">${ins.assetTag} • NEOM Spine S4</span>
              </div>
            </div>
            <button onclick="Modals.close()" class="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="p-6 flex flex-col gap-4 text-start max-h-[70vh] overflow-y-auto">
            <span class="text-[12px] font-bold uppercase text-[#64748B]">Regulatory Checklist Items</span>
            <div class="flex flex-col gap-3">
              ${ins.checkpoints.map((cp, idx) => `
                <label class="p-3 rounded-xl bg-[#F8F9FF] border border-[#E2E8F0] flex items-start gap-3 cursor-pointer hover:bg-[#EFF4FF] transition-colors">
                  <input type="checkbox" checked class="mt-1 w-4 h-4 rounded text-[#168C82] focus:ring-0"/>
                  <span class="text-[13px] text-[#172B3A] font-medium leading-snug">${isAr ? cp.itemAr : cp.itemEn}</span>
                </label>
              `).join('')}
            </div>

            <div class="p-3 bg-[#E6F5F3] rounded-xl text-[12px] text-[#168C82] font-semibold flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">verified</span>
              <span>Signed & Verified by Eng. Tariq Al-Otaibi (HSE Director)</span>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button onclick="Modals.close()" class="px-4 py-2 rounded-xl border border-[#CBD5E1] text-[#172B3A] text-[12px] font-bold">
                Close
              </button>
              <button onclick="store.executeInspection('${ins.id}'); Modals.close();" class="px-5 py-2 rounded-xl bg-[#168C82] text-white text-[12px] font-bold shadow-sm">
                Pass & Certify Equipment
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  openInspectionModal() {
    Modals.openInspectionChecklist('ins-03');
  },

  // 7. Regulatory Audit Pack Generator Modal
  openExportAuditPack() {
    const isAr = store.locale === 'ar';
    const container = document.getElementById('modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001D37]/70 backdrop-blur-xs animate-fade-in" onclick="Modals.close(event)">
        <div class="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-md overflow-hidden flex flex-col" onclick="event.stopPropagation()">
          <div class="p-5 bg-[#001D37] text-white flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-[#90f4e8] text-[22px]">download_for_offline</span>
              <h3 class="text-[16px] font-bold">${store.t('modalExportTitle')}</h3>
            </div>
            <button onclick="Modals.close()" class="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="p-6 flex flex-col gap-4 text-start">
            <p class="text-[13px] text-[#64748B]">
              ${isAr ? 'سيتم تجميع كافة سجلات العمال، تراخيص أرامكو، والتقارير الفنية في حزمة بيانات موثقة رقمياً.' : 'Compiles all 152 personnel records, Saudi Aramco rigging licenses, and gate logs into an official PDF/CSV audit bundle.'}
            </p>

            <div class="flex flex-col gap-2">
              <button onclick="Modals.triggerDownload('csv')" class="p-3 rounded-xl border border-[#CBD5E1] hover:bg-[#F5F7FA] flex items-center justify-between transition-colors">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-[#168C82] text-[20px]">table_view</span>
                  <span class="text-[13px] font-bold text-[#172B3A]">Workforce Audit Roster (CSV / Excel)</span>
                </div>
                <span class="material-symbols-outlined text-[18px] text-[#64748B]">download</span>
              </button>

              <button onclick="Modals.triggerDownload('pdf')" class="p-3 rounded-xl border border-[#CBD5E1] hover:bg-[#F5F7FA] flex items-center justify-between transition-colors">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-[#C83E4D] text-[20px]">picture_as_pdf</span>
                  <span class="text-[13px] font-bold text-[#172B3A]">Authority Compliance Pack (PDF)</span>
                </div>
                <span class="material-symbols-outlined text-[18px] text-[#64748B]">download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  triggerDownload(format) {
    Modals.close();
    store.showToast(store.locale === 'ar' ? `تم تصدير حزمة التدقيق بنجاح (${format.toUpperCase()})` : `Exported SiteReady GCC Compliance Audit Pack (${format.toUpperCase()})`, 'success');
  },

  close(e) {
    if (e && e.target !== e.currentTarget) return;
    const container = document.getElementById('modal-container');
    if (container) container.innerHTML = '';
  }
};
