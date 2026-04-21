import { Routes } from '@angular/router';
import { authGuard, auditorGuard, coordinadorGuard, gerenteGuard, verificadorGuard, cajeraGuard, distribuidoraGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },

  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/products/products.component').then(m => m.ProductsComponent),
      },
      {
        path: 'sucursales',
        loadComponent: () =>
          import('./features/admin/subsidiaries/subsidiaries.component').then(m => m.SubsidiariesComponent),
      },
      {
        path: 'fechas-corte',
        loadComponent: () =>
          import('./features/admin/expiration-dates/expiration-dates.component')
            .then(m => m.ExpirationDatesComponent),
      },
      {
        path: 'coordinadores',
        loadComponent: () =>
          import('./features/admin/coordinators/coordinators.component').then(m => m.CoordinatorsComponent),
      },
      {
        path: 'verificadores',
        loadComponent: () =>
          import('./features/admin/verifiers/verifiers.component').then(m => m.VerifiersComponent),
      },
      {
        path: 'cajeras',
        loadComponent: () =>
          import('./features/admin/cashiers/cashiers.component').then(m => m.CashiersComponent),
      },
      {
        path: 'gerentes',
        loadComponent: () =>
          import('./features/admin/managers/managers.component').then(m => m.ManagersComponent),
      },
      {
        path: 'historiales',
        loadComponent: () =>
          import('./features/admin/history/history.component').then(m => m.HistoryComponent),
      },
      {
        path: 'gerente/solicitudes',
        loadComponent: () =>
          import('./features/manager/applications/applications.component').then(m => m.ApplicationsComponent),
      },
      {
        path: 'gerente/solicitudes/:id',
        loadComponent: () =>
          import('./features/manager/applications/application-detail.component').then(m => m.ApplicationDetailComponent),
      },
      {
        path: 'gerente/puntos',
        loadComponent: () =>
          import('./features/manager/incentives/manager-incentives.component').then(m => m.ManagerIncentivesComponent),
      },
      {
        path: 'verificador/pre-solicitudes',
        loadComponent: () =>
          import('./features/verifier/pre-applications/pre-applications.component').then(m => m.VerifierPreApplicationsComponent),
      },
      {
        path: 'verificador/pre-solicitudes/:id',
        loadComponent: () =>
          import('./features/verifier/pre-applications/pre-application-detail.component').then(m => m.VerifierPreApplicationDetailComponent),
      },
      {
        path: 'coordinador/pre-solicitudes',
        loadComponent: () =>
          import('./features/coordinator/pre-applications/pre-applications.component').then(m => m.PreApplicationsComponent),
      },
      {
        path: 'coordinador/pre-solicitudes/nueva',
        loadComponent: () =>
          import('./features/coordinator/pre-applications/new-pre-application.component').then(m => m.NewPreApplicationComponent),
      },
      {
        path: 'coordinador/reclamos',
        loadComponent: () =>
          import('./features/coordinator/reclamos/reclamos.component').then(
            m => m.CoordinadorReclamosComponent
          ),
      },
      {
        path: 'coordinador/reclamos/:id',
        loadComponent: () =>
          import('./features/coordinator/reclamos/reclamo-detail.component').then(
            m => m.ReclamoDetailComponent
          ),
      },
      {
        path: 'auditor/dashboard',
        loadComponent: () =>
          import('./features/auditor/auditor-dashboard.component').then(m => m.AuditorDashboardComponent),
      },
      {
        path: 'auditor/logs',
        loadComponent: () =>
          import('./features/auditor/auditor-logs.component').then(m => m.AuditorLogsComponent),
      },
      {
        path: 'auditor/pre-solicitudes',
        loadComponent: () =>
          import('./features/auditor/auditor-pre-solicitudes.component').then(m => m.AuditorPreSolicitudesComponent),
      },
      {
        path: 'auditor/pre-solicitudes/:id',
        loadComponent: () =>
          import('./features/auditor/auditor-pre-solicitud-detalle.component').then(m => m.AuditorPreSolicitudDetalleComponent),
      },
      {
        path: 'auditor/usuarios',
        loadComponent: () =>
          import('./features/auditor/auditor-usuarios.component').then(m => m.AuditorUsuariosComponent),
      },
      {
        path: 'auditor/usuarios/:id',
        loadComponent: () =>
          import('./features/auditor/auditor-usuario-detalle.component').then(m => m.AuditorUsuarioDetalleComponent),
      },
      {
        path: 'auditor/distribuidoras',
        loadComponent: () =>
          import('./features/auditor/auditor-distribuidoras.component').then(m => m.AuditorDistribuidorasComponent),
      },
      {
        path: 'auditor/pagos',
        loadComponent: () =>
          import('./features/auditor/auditor-pagos.component').then(m => m.AuditorPagosComponent),
      },
      {
        path: 'auditor/productos',
        loadComponent: () =>
          import('./features/auditor/auditor-productos.component').then(m => m.AuditorProductosComponent),
      },
      // ── Vistas de solo lectura ──────────────────────────────────────────
      {
        path: 'pre-solicitudes',
        loadComponent: () =>
          import('./features/admin/pre-solicitudes/admin-pre-solicitudes.component').then(m => m.AdminPreSolicitudesComponent),
      },
      {
        path: 'pre-solicitudes/:id',
        loadComponent: () =>
          import('./features/admin/pre-solicitudes/admin-pre-solicitud-detalle.component').then(m => m.AdminPreSolicitudDetalleComponent),
      },
      {
        path: 'reclamos',
        loadComponent: () =>
          import('./features/admin/reclamos/admin-reclamos.component').then(m => m.AdminReclamosComponent),
      },
      {
        path: 'reclamos/:id',
        loadComponent: () =>
          import('./features/admin/reclamos/admin-reclamo-detalle.component').then(m => m.AdminReclamoDetalleComponent),
      },
      {
        path: 'vales',
        loadComponent: () =>
          import('./features/admin/vales/admin-vales.component').then(m => m.AdminValesComponent),
      },
      {
        path: 'vales/:id',
        loadComponent: () =>
          import('./features/admin/vales/admin-vale-detalle.component').then(m => m.AdminValeDetalleComponent),
      },
    ],
  },

  {
    path: 'gerente',
    canActivate: [gerenteGuard],
    loadComponent: () =>
      import('./layout/manager-shell/manager-shell.component').then(m => m.ManagerShellComponent),
    children: [
      { path: '', redirectTo: 'solicitudes', pathMatch: 'full' },
      {
        path: 'solicitudes',
        loadComponent: () =>
          import('./features/manager/applications/applications.component').then(m => m.ApplicationsComponent),
      },
      {
        path: 'distribuidoras',
        loadComponent: () =>
          import('./features/manager/distributors/distributors.component').then(m => m.DistributorsComponent),
      },
      {
        path: 'puntos',
        loadComponent: () =>
          import('./features/manager/incentives/manager-incentives.component').then(m => m.ManagerIncentivesComponent),
      },
      {
        path: 'solicitudes/:id',
        loadComponent: () =>
          import('./features/manager/applications/application-detail.component').then(m => m.ApplicationDetailComponent),
      },
      {
        path: 'reclamos',
        loadComponent: () =>
          import('./features/manager/reclamos/reclamos.component').then(m => m.ReclamosComponent),
      },
      {
        path: 'reclamos/:id',
        loadComponent: () =>
          import('./features/manager/reclamos/reclamo-detail.component').then(m => m.ReclamoDetailComponent),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/manager/reportes/reportes.component').then(m => m.ReportesComponent),
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./features/manager/historial/historial.component').then(m => m.HistorialComponent),
      },
    ],
  },

  {
    path: 'coordinador',
    canActivate: [coordinadorGuard],
    loadComponent: () =>
      import('./layout/coordinator-shell/coordinator-shell.component').then(m => m.CoordinatorShellComponent),
    children: [
      { path: '', redirectTo: 'pre-solicitudes', pathMatch: 'full' },
      {
        path: 'pre-solicitudes',
        loadComponent: () =>
          import('./features/coordinator/pre-applications/pre-applications.component').then(m => m.PreApplicationsComponent),
      },
      {
        path: 'pre-solicitudes/nueva',
        loadComponent: () =>
          import('./features/coordinator/pre-applications/new-pre-application.component').then(m => m.NewPreApplicationComponent),
      },
      {
        path: 'reclamos',
        loadComponent: () =>
          import('./features/coordinator/reclamos/reclamos.component').then(
            m => m.CoordinadorReclamosComponent
          ),
      },
      {
        path: 'reclamos/:id',
        loadComponent: () =>
          import('./features/coordinator/reclamos/reclamo-detail.component').then(
            m => m.ReclamoDetailComponent
          ),
      },
    ],
  },

  {
    path: 'verificador',
    canActivate: [verificadorGuard],
    loadComponent: () =>
      import('./layout/verifier-shell/verifier-shell.component').then(m => m.VerifierShellComponent),
    children: [
      { path: '', redirectTo: 'pre-solicitudes', pathMatch: 'full' },
      {
        path: 'pre-solicitudes',
        loadComponent: () =>
          import('./features/verifier/pre-applications/pre-applications.component').then(m => m.VerifierPreApplicationsComponent),
      },
      {
        path: 'pre-solicitudes/:id',
        loadComponent: () =>
          import('./features/verifier/pre-applications/pre-application-detail.component').then(m => m.VerifierPreApplicationDetailComponent),
      },
    ],
  },

  {
    path: 'auditor',
    canActivate: [auditorGuard],
    loadComponent: () =>
      import('./layout/auditor-shell/auditor-shell.component').then(m => m.AuditorShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/auditor/auditor-dashboard.component').then(m => m.AuditorDashboardComponent),
      },
      {
        path: 'logs',
        loadComponent: () =>
          import('./features/auditor/auditor-logs.component').then(m => m.AuditorLogsComponent),
      },
      {
        path: 'pre-solicitudes',
        loadComponent: () =>
          import('./features/auditor/auditor-pre-solicitudes.component').then(m => m.AuditorPreSolicitudesComponent),
      },
      {
        path: 'pre-solicitudes/:id',
        loadComponent: () =>
          import('./features/auditor/auditor-pre-solicitud-detalle.component').then(m => m.AuditorPreSolicitudDetalleComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/auditor/auditor-usuarios.component').then(m => m.AuditorUsuariosComponent),
      },
      {
        path: 'usuarios/:id',
        loadComponent: () =>
          import('./features/auditor/auditor-usuario-detalle.component').then(m => m.AuditorUsuarioDetalleComponent),
      },
      {
        path: 'distribuidoras',
        loadComponent: () =>
          import('./features/auditor/auditor-distribuidoras.component').then(m => m.AuditorDistribuidorasComponent),
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./features/auditor/auditor-pagos.component').then(m => m.AuditorPagosComponent),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/auditor/auditor-productos.component').then(m => m.AuditorProductosComponent),
      },
    ],
  },

  {
  path: 'cajera',
  canActivate: [cajeraGuard],
  loadComponent: () =>
    import('./layout/cajera-shell/cajera-shell.component').then(m => m.CajeraShellComponent),
  children: [
    { path: '', redirectTo: 'conciliaciones', pathMatch: 'full' },
    {
      path: 'conciliaciones',
      loadComponent: () =>
        import('./features/cajera/reconciliations/reconciliations.component').then(m => m.ReconciliationsComponent),
    },
    {
      path: 'reclamos',
      loadComponent: () =>
        import('./features/cajera/reclamos/cajera-reclamos.component').then(m => m.CajeraReclamosComponent),
    },
    {
      path: 'reclamos/:id',
      loadComponent: () =>
        import('./features/cajera/reclamos/cajera-reclamo-detail.component').then(m => m.CajeraReclamoDetailComponent),
    },
    {
      path: 'vales',
      loadComponent: () =>
        import('./features/cajera/vales-cajera/vales-cajera.component').then(m => m.ValesCajeraComponent),
    },
    {
      path: 'puntos',
      loadComponent: () =>
        import('./features/cajera/puntos-cajera/puntos-cajera.component').then(m => m.PuntosCajeraComponent),
    },
  ],
},

{
  path: 'distribuidora',
  canActivate: [distribuidoraGuard],
  loadComponent: () =>
    import('./layout/distribuidora-shell/distribuidora-shell.component').then(m => m.DistribuidoraShellComponent),
  children: [
    { path: '', redirectTo: 'clientes', pathMatch: 'full' },
    {
      path: 'clientes',
      loadComponent: () =>
        import('./features/distribuidora/clientes/clientes.component').then(m => m.ClientesComponent),
    },
    {
      path: 'incentivos',
      loadComponent: () =>
        import('./features/distribuidora/incentivos/incentivos.component').then(m => m.IncentivosComponent),
    },
    {
      path: 'vales',
      loadComponent: () =>
        import('./features/distribuidora/vales/vales.component').then(m => m.ValesComponent),
    },
    {
      path: 'reclamos',
      loadComponent: () =>
        import('./features/distribuidora/reclamos/distribuidora-reclamos.component').then(m => m.DistribuidoraReclamosComponent),
    },
    {
      path: 'reclamos/nuevo',
      loadComponent: () =>
        import('./features/distribuidora/reclamos/distribuidora-reclamo-form.component').then(m => m.DistribuidoraReclamoFormComponent),
    },
    {
      path: 'mis-pagos',
      loadComponent: () =>
        import('./features/distribuidora/mis-pagos/mis-pagos.component').then(m => m.MisPagosComponent),
    },
    {
      path: 'vales/:id',
      loadComponent: () =>
        import('./features/distribuidora/vale-detail/vale-detail.component').then(m => m.ValeDetailComponent),
    },
  ],
},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
