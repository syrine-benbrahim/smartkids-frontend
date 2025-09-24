// app.routes.ts - Mise à jour avec les routes d'inscriptions + activités
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './core/auth.guard';
import { RoleGuard } from './core/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Routes Admin
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },

      // Menus routes
      {
        path: 'menus',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/menus/menus-list.component').then(m => m.MenusListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/admin/menus/menu-form.component').then(m => m.MenuFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/admin/menus/menu-detail.component').then(m => m.MenuDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/admin/menus/menu-form.component').then(m => m.MenuFormComponent)
          }
        ]
      },

      // Educateurs routes
      {
        path: 'educateurs',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/educateurs/educateurs-list.component').then(m => m.EducateursListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/admin/educateurs/educateur-form.component').then(m => m.EducateurFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/admin/educateurs/educateur-detail.component').then(m => m.EducateurDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/admin/educateurs/educateur-form.component').then(m => m.EducateurFormComponent)
          }
        ]
      },

      // Classes routes
      {
        path: 'classes',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/classes/classes-list.component').then(m => m.ClassesListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/admin/classes/classe-form.component').then(m => m.ClasseFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/admin/classes/classe-detail.component').then(m => m.ClasseDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/admin/classes/classe-form.component').then(m => m.ClasseFormComponent)
          }
        ]
      },

      // Affectations routes
      {
        path: 'affectations',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/affectations/affectations-management.component').then(m => m.AffectationsManagementComponent)
          }
        ]
      },

      // **NOUVELLES ROUTES INSCRIPTIONS ADMIN**
      {
        path: 'inscriptions',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/inscriptions/inscriptions-list.component').then(m => m.InscriptionsListComponent)
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/admin/inscriptions/inscriptions-dashboard.component').then(m => m.InscriptionsDashboardComponent)
          },
          {
            path: 'classe/:id/liste-attente',
            loadComponent: () => import('./pages/admin/inscriptions/liste-attente.component').then(m => m.ListeAttenteComponent)
          }
        ]
      },

      // **NOUVELLES ROUTES ACTIVITES ADMIN**
      {
        path: 'activites',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/activites/activites-list.component').then(m => m.ActivitesListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/admin/activites/activite-form.component').then(m => m.ActiviteFormComponent)
          },
          
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/admin/activites/activite-form.component').then(m => m.ActiviteFormComponent)
          }
        ]
      }
    ]
  },

  // Routes Educateurs
  {
    path: 'educateur',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['educateur'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/educateur/educateur-dashboard.component').then(m => m.EducateurDashboardComponent)
      },
      {
        path: 'classes',
        loadComponent: () => import('./pages/educateur/classes-list.component').then(m => m.EducateurClassesListComponent)
      },
      {
        path: 'classes/:classeId/presences',
        loadComponent: () => import('./pages/educateur/presence-management.component').then(m => m.PresenceManagementComponent)
      },
      {
        path: 'presences-jour',
        loadComponent: () => import('./pages/educateur/presences-jour.component').then(m => m.PresencesJourComponent)
      }
    ]
  },

  // **NOUVELLES ROUTES PARENT**
  {
    path: 'parent',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['parent'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/parent/parent-dashboard-enhanced.component').then(m => m.ParentDashboardEnhancedComponent)
      },
      {
        path: 'inscriptions',
        children: [
          {
            path: 'create',
            loadComponent: () => import('./pages/parent/inscription-form.component').then(m => m.ParentInscriptionFormComponent)
          }
        ]
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
