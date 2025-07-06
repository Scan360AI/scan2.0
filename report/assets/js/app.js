/**
 * =================================================================
 * SCAN360 - Motore di Rendering del Report v2.0 (Multi-Pagina)
 * File: /report/assets/js/app.js
 * =================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURAZIONE ---
const DATA_FILE_PATH = '/report/data/report_data.json';
    const PAGE_ID = document.body.dataset.pageId;

    // --- 2. FUNZIONI DI UTILITY ---
    const getValue = (obj, path, defaultValue = '') => path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
    const formatCurrency = (value, digits = 0) => {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: digits }).format(num);
    };
    const createElement = (tag, { classes = [], attributes = {}, text = '', html = '' } = {}) => {
        const el = document.createElement(tag);
        if (classes.length) el.classList.add(...classes.filter(c => c));
        for (const attr in attributes) el.setAttribute(attr, attributes[attr]);
        if (text) el.textContent = text;
        if (html) el.innerHTML = html;
        return el;
    };

    // --- 3. FUNZIONI DI RENDERING (COMPONENTI COMUNI) ---

    const renderSidebar = (data) => {
        const container = document.getElementById('sidebar-container');
        if (!container) return;
        const meta = data.meta;
        
        const header = createElement('div', { classes: ['sidebar-header'] });
        header.append(
            createElement('img', { attributes: { src: 'assets/img/logo_scan.png', alt: 'SCAN Logo', style: 'max-height: 40px;' } }),
            createElement('h5', { text: getValue(meta, 'company.name'), classes: ['mt-2'] })
        );
        
        const nav = createElement('ul', { classes: ['sidebar-nav', 'flex-grow-1'] });
        getValue(meta, 'sidebar_links', []).forEach(link => {
            if (link.group_title) {
                nav.appendChild(createElement('li', { classes: ['nav-title'], text: link.group_title }));
            } else {
                const navItem = createElement('li', { classes: ['nav-item'] });
                const navLink = createElement('a', { 
                    classes: ['nav-link', PAGE_ID === link.page_id ? 'active' : ''], 
                    attributes: { href: link.href }, 
                    html: `<i class="fa-fw ${link.icon}"></i> ${link.title}`
                });
                navItem.appendChild(navLink);
                nav.appendChild(navItem);
            }
        });

        const footer = createElement('div', { classes: ['sidebar-footer'] });
        footer.appendChild(createElement('small', { text: `SCAN360 © ${new Date().getFullYear()} Kitzanos` }));
        
        container.append(header, nav, footer);
    };

    const renderHeader = (data) => {
        const container = document.getElementById('header-container');
        if (!container) return;
        const meta = data.meta;
        container.innerHTML = `
            <div class="header-title"><h4 class="mb-0">${getValue(meta, 'company.name')}</h4></div>
            <div class="header-controls d-flex align-items-center">
                <span class="badge ${getValue(meta, 'irp.style_class')} me-3">IRP: ${getValue(meta, 'irp.score')} (${getValue(meta, 'irp.category_letter')})</span>
                <span class="me-3 small text-muted">Aggiornamento: ${getValue(meta, 'report.date')}</span>
                <button class="btn btn-sm btn-outline-secondary me-2 print-button" onclick="window.print()"><i class="fas fa-print"></i> Stampa</button>
            </div>`;
    };

    const renderFooter = () => {
        const container = document.getElementById('footer-container');
        if (!container) return;
        container.innerHTML = `<div class="container-fluid px-4"><div class="row"><div class="col-md-6 text-center text-md-start mb-2 mb-md-0">SCAN360 © ${new Date().getFullYear()}</div><div class="col-md-6 text-center text-md-end">Powered by <a href="http://www.kitzanos.com" target="_blank" class="text-white fw-bold">Kitzanos Lab</a><img src="assets/img/logo_kitzanos.png" alt="Kitzanos Logo" class="ms-2" style="height: 20px; vertical-align: middle;"></div></div></div>`;
    };

    const renderPrintHeader = (data) => {
        const container = document.getElementById('print-header-container');
        if (!container) return;
        container.innerHTML = `<h1 class="text-center mb-0">${getValue(data, 'meta.company.name')}</h1><p class="text-center mb-0">Report Dettagliato | ${getValue(data, 'meta.report.date')}</p><hr>`;
    };
    
    // --- 4. FUNZIONI DI RENDERING (CONTENUTO SPECIFICO PAGINA) ---

    const renderDashboardPage = (data) => {
        const wrapper = document.getElementById('dashboard-content-wrapper');
        const kpiContainer = document.getElementById('kpi-cards-container');
        const chartsContainer = document.getElementById('charts-container');
        if (!wrapper || !kpiContainer || !chartsContainer) return;

        // Render KPI Cards
        getValue(data, 'dashboard.kpi_cards', []).forEach(kpiData => {
            const trendValueHtml = kpiData.trend_value.includes('<span') ? kpiData.trend_value : `<span>${kpiData.trend_value}</span>`;
            const kpiCardHtml = `
                <div class="kpi-card-v2 ${kpiData.border_class}">
                    <i class="${kpiData.icon_class} kpi-icon-modern-bg"></i>
                    <h4 class="card-title-modern">${kpiData.title}</h4>
                    <div class="kpi-value-modern">${kpiData.value}</div>
                    <div class="kpi-trend-modern ${kpiData.trend_class}">
                        <i class="${kpiData.trend_icon} trend-icon"></i>${trendValueHtml}<span class="text-muted small ms-2">${kpiData.trend_period}</span>
                    </div>
                    <p class="kpi-description-modern">${kpiData.description}</p>
                    <a href="${kpiData.link_href}" class="btn btn-outline-primary btn-sm btn-pill mt-2 ${kpiData.link_class}">${kpiData.link_text}</a>
                </div>`;
            kpiContainer.appendChild(createElement('div', { classes: ['col-xl-3', 'col-md-6', 'mb-4'], html: kpiCardHtml }));
        });

        // Render Chart Cards
        for (const chartKey in data.dashboard.charts) {
            const chartInfo = data.dashboard.charts[chartKey];
            const chartCardHtml = `<div class="dashboard-card"><h6 class="card-title-modern text-center">${chartInfo.title}</h6><div class="chart-container" style="height: 300px;"><canvas id="${chartKey}Chart"></canvas></div></div>`;
            chartsContainer.appendChild(createElement('div', { classes: ['col-lg-6', 'mb-4'], html: chartCardHtml }));
        }
        
        wrapper.style.display = 'block'; // Mostra il contenuto
    };

    const renderSintesiPage = (data) => {
        const wrapper = document.getElementById('sintesi-content-wrapper');
        if (!wrapper) return;
        
        const sintesiData = data.parte1_sintesi;
        
        // Render Sezione 1.1: Summary IRP
        const summaryContainer = document.getElementById('summary-section-container');
        const irp = sintesiData.summary_section.irp_card;
        let ratingsHtml = '';
        sintesiData.summary_section.other_ratings.forEach(r => {
            ratingsHtml += `<li class="col-sm-6 d-flex align-items-center"><span class="icon-circle bg-success me-2"><i class="${r.icon}"></i></span><strong>${r.label}</strong> ${r.value} <span class="badge ${r.badge_class} ms-1">${r.badge_text}</span></li>`;
        });
        summaryContainer.innerHTML = `
            <h2 class="section-title"><i class="${sintesiData.summary_section.icon} me-2"></i>${sintesiData.summary_section.title}</h2>
            <div class="irp-visual-section">
                <div class="row align-items-center">
                    <div class="col-md-4 text-center mb-4 mb-md-0">
                        <div class="irp-score-circle ${irp.style_class_circle}"><span class="irp-score-value">${irp.score}</span><span class="irp-score-max">/ 100</span></div>
                        <div class="irp-category-text ${irp.style_class_text} mt-2">Rischio ${irp.category_text} <span class="status-badge ${irp.style_class_badge}">${irp.category_letter}</span></div>
                    </div>
                    <div class="col-md-8">
                        <h4 class="mb-3 fw-bold" style="color: var(--primary);">Valutazione Generale</h4>
                        <p class="mb-3">${sintesiData.summary_section.summary_text}</p>
                        <div class="other-ratings border-top pt-3 mt-3"><h6 class="card-title-small mb-2">Altri Indicatori:</h6><ul class="list-unstyled mb-0 row gx-3 gy-2">${ratingsHtml}</ul></div>
                    </div>
                </div>
            </div>`;

        // Render Sezione 1.2: Profilo
        const profileContainer = document.getElementById('profile-section-container');
        let anagraficaHtml = '';
        sintesiData.profile_section.anagrafica.forEach(p => anagraficaHtml += `<li><i class='${p.icon} fa-fw'></i><strong>${p.label}</strong> ${p.value}</li>`);
        let strutturaHtml = '';
        sintesiData.profile_section.struttura.forEach(p => strutturaHtml += `<li><i class='${p.icon} fa-fw'></i><strong>${p.label}</strong> ${p.value}</li>`);
        profileContainer.innerHTML = `
            <h2 class="section-title"><i class="${sintesiData.profile_section.icon} me-2"></i>${sintesiData.profile_section.title}</h2>
            <div class="card"><div class="card-body"><div class="row">
                <div class="col-lg-6"><h6>Anagrafica e Settore</h6><ul class="list-unstyled">${anagraficaHtml}</ul></div>
                <div class="col-lg-6"><h6>Struttura e Personale</h6><ul class="list-unstyled">${strutturaHtml}</ul></div>
                <div class="col-12 mt-3"><h6>Modello di Business</h6>${sintesiData.profile_section.business_model_html}</div>
            </div></div></div>`;
            
        // Render Sezione 1.3: SWOT
        const swotContainer = document.getElementById('swot-section-container');
        const swot = sintesiData.swot_section.items;
        let swotHtml = '<div class="row">';
        for(const key in swot){
            let pointsHtml = '';
            swot[key].points.forEach(p => pointsHtml += `<li>${p}</li>`);
            swotHtml += `
                <div class="col-md-6 col-lg-3 mb-4"><div class="dashboard-card h-100">
                    <div class="card-header d-flex align-items-center"><i class="${swot[key].icon} me-2"></i> ${swot[key].title}</div>
                    <div class="card-body"><ul>${pointsHtml}</ul></div>
                </div></div>`;
        }
        swotHtml += '</div>';
        swotContainer.innerHTML = `<h2 class="section-title"><i class="${sintesiData.swot_section.icon} me-2"></i>${sintesiData.swot_section.title}</h2>${swotHtml}`;

        // Render Sezione 1.4: CCII
        const cciiContainer = document.getElementById('ccii-section-container');
        const ccii = sintesiData.ccii_section;
        cciiContainer.innerHTML = `
             <h2 class="section-title"><i class="${ccii.icon} me-2"></i>${ccii.title}</h2>
             <div class="alert ${ccii.status_class} d-flex align-items-center">
                <i class="${ccii.status_icon} fa-2x me-3"></i>
                <div><h6 class="mb-0">${ccii.status_text}</h6>${ccii.description_html}</div>
             </div>`;

        wrapper.style.display = 'block';
    };

    // --- 5. FUNZIONE PRINCIPALE DI AVVIO ---

    const main = async () => {
        if (!PAGE_ID) {
            document.body.innerHTML = '<h1>Errore: ID pagina non definito nel tag <body> (data-page-id).</h1>';
            return;
        }

        try {
            const response = await fetch(DATA_FILE_PATH);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const reportData = await response.json();

            document.title = `${getValue(reportData, PAGE_ID + '.page_title', 'Report')} - ${getValue(reportData, 'meta.company.name')}`;
            document.getElementById('loading-indicator').remove();

            renderSidebar(reportData);
            renderHeader(reportData);
            renderFooter();
            renderPrintHeader(reportData);

            // Esegue la funzione di rendering specifica per la pagina corrente
            switch (PAGE_ID) {
                case 'dashboard':
                    renderDashboardPage(reportData);
                    // Inizializza i grafici della dashboard
                    for (const chartKey in reportData.dashboard.charts) {
                        initChart(`${chartKey}Chart`, reportData.dashboard.charts[chartKey].data, reportData.dashboard.charts[chartKey].options);
                    }
                    break;
                case 'parte1_sintesi':
                    renderSintesiPage(reportData);
                    // Aggiungere qui l'inizializzazione di eventuali grafici per questa pagina
                    break;
                // Aggiungere qui i 'case' per le altre pagine quando verranno create
                default:
                    console.warn(`Nessuna funzione di rendering definita per la pagina con ID: ${PAGE_ID}`);
            }

        } catch (error) {
            console.error("ERRORE CRITICO: Impossibile caricare o renderizzare il report.", error);
            const container = document.getElementById('main-report-content') || document.body;
            container.innerHTML = `<div class="alert alert-danger p-4"><h4><i class="fas fa-exclamation-triangle me-2"></i>Errore nel Caricamento del Report</h4><p>Non è stato possibile caricare il file di dati <code>${DATA_FILE_PATH}</code>. Assicurati che il file esista, sia accessibile e non contenga errori di sintassi JSON.</p><pre class="small bg-light p-2 rounded">${error.message}</pre></div>`;
            document.getElementById('loading-indicator')?.remove();
        }
    };

    main();
});
