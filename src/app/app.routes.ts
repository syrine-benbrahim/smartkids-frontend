// app.routes.ts - Configuration complète des routes
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomepageComponent } from './pages/home/homepage.component';
import { AuthGuard } from './core/auth.guard';
import { RoleGuard } from './core/role.guard';
import { AppLayoutComponent } from './shared/layout/app-layout.component';
import { PaymentComponent } from './payment/payment.component';

export const routes: Routes = [
  // ==================== ROUTES PUBLIQUES ====================
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'pay/:token', component: PaymentComponent },
  { path: 'pay/:token/quote', component: PaymentComponent },

  // ==================== CHAT (Accessible à tous les utilisateurs authentifiés) ====================
  {
    path: 'chat',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/chat/chat-rooms-list.component')
          .then(m => m.ChatRoomsListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/chat/chat-room.component')
          .then(m => m.ChatRoomComponent)
      }
    ]
  },

  // ==================== ROUTES ADMIN ====================
  {
    path: 'admin',
    component: AppLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    children: [
      // Dashboard Admin
      {
        path: '',
        loadComponent: () => import('./pages/admin/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },

      // ─────── EMPLOIS DU TEMPS ───────
      {
        path: 'emplois',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/emplois/emplois-management.component')
              .then(m => m.EmploisManagementComponent)
          },
          {
            path: 'generate',
            loadComponent: () => import('./pages/admin/emplois/emploi-generation-form.component')
              .then(m => m.EmploiGenerationFormComponent)
          },
          {
            path: 'view/:id',
            loadComponent: () => import('./pages/admin/emplois/emploi-viewer.component')
              .then(m => m.EmploiViewerComponent)
          },
          {
            path: 'template/:id',
            loadComponent: () => import('./pages/admin/emplois/emploi-viewer.component')
              .then(m => m.EmploiViewerComponent)
          },
          {
            path: 'classe/:classeId',
            loadComponent: () => import('./pages/admin/emplois/emploi-viewer.component')
              .then(m => m.EmploiViewerComponent)
          }
        ]
      },

      // ─────── MENUS ───────
      {
        path: 'menus',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/menus/menus-list.component')
              .then(m => m.MenusListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/admin/menus/menu-form.component')
              .then(m => m.MenuFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/admin/menus/menu-detail.component')
              .then(m => m.MenuDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/admin/menus/menu-form.component')
              .then(m => m.MenuFormComponent)
          }
        ]
      },

      // ─────── EDUCATEURS ───────
      {
        path: 'educateurs',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/educateurs/educateurs-list.component')
              .then(m => m.EducateursListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/admin/educateurs/educateur-form.component')
              .then(m => m.EducateurFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/admin/educateurs/educateur-detail.component')
              .then(m => m.EducateurDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/admin/educateurs/educateur-form.component')
              .then(m => m.EducateurFormComponent)
          }
        ]
      },

      // ─────── CLASSES ───────
      {
        path: 'classes',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/classes/classes-list.component')
              .then(m => m.ClassesListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/admin/classes/classe-form.component')
              .then(m => m.ClasseFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/admin/classes/classe-detail.component')
              .then(m => m.ClasseDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/admin/classes/classe-form.component')
              .then(m => m.ClasseFormComponent)
          }
        ]
      },
      // ─────── SALLES ───────
      {
        path: 'salles',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/salles/salles-list.component')
              .then(m => m.SallesListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/admin/salles/salles-modal.component')
              .then(m => m.SallesModalComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/admin/salles/salles-modal.component')
              .then(m => m.SallesModalComponent)
          }
        ]
      },
      // ─────── MATIÈRES ───────
      {
        path: 'matieres',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/matieres/matieres-list.component')
              .then(m => m.MatieresListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/admin/matieres/matieres-modal.component')
              .then(m => m.MatieresModalComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/admin/matieres/matieres-modal.component')
              .then(m => m.MatieresModalComponent)
          }
        ]
      },

      // ─────── AFFECTATIONS ───────
      {
        path: 'affectations',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/affectations/affectations-management.component')
              .then(m => m.AffectationsManagementComponent)
          }
        ]
      },

      // ─────── INSCRIPTIONS ───────
      {
        path: 'inscriptions',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/inscriptions/inscriptions-list.component')
              .then(m => m.InscriptionsListComponent)
          }
        ]
      },

      // ─────── ACTIVITÉS ADMIN ───────
      {
        path: 'activites',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/activites/activites-list.component')
              .then(m => m.ActivitesListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/admin/activites/activite-form.component')
              .then(m => m.ActiviteFormComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./pages/admin/activites/activite-form.component')
              .then(m => m.ActiviteFormComponent)
          }
        ]
      }
    ]
  },

  // ==================== ROUTES ÉDUCATEUR ====================
  {
    path: 'educateur',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['educateur'] },
    children: [
      // Dashboard Éducateur
      {
        path: '',
        loadComponent: () => import('./pages/educateur/educateur-dashboard.component')
          .then(m => m.EducateurDashboardComponent)
      },

      // ─────── EMPLOIS ───────
      {
        path: 'emploi',
        children: [
          {
            path: 'jour',
            loadComponent: () => import('./pages/educateur/emploi/emploi-jour.component')
              .then(m => m.EmploiJourComponent)
          },
          {
            path: 'semaine',
            loadComponent: () => import('./pages/educateur/emploi/emploi-semaine.component')
              .then(m => m.EmploiSemaineComponent)
          },
          {
            path: 'mes-classes',
            loadComponent: () => import('./pages/educateur/emploi/mes-classes-emploi.component')
              .then(m => m.MesClassesEmploiComponent)
          }
        ]
      },

      // ─────── CLASSES & PRÉSENCES ───────
      {
        path: 'classes',
        loadComponent: () => import('./pages/educateur/classes-list.component')
          .then(m => m.EducateurClassesListComponent)
      },
      {
        path: 'classes/:classeId/presences',
        loadComponent: () => import('./pages/educateur/presence-management.component')
          .then(m => m.PresenceManagementComponent)
      },
      {
        path: 'presences-jour',
        loadComponent: () => import('./pages/educateur/presences-jour.component')
          .then(m => m.PresencesJourComponent)
      }
    ]
  },

  // ==================== ROUTES PARENT ====================
  {
    path: 'parent',
    component: AppLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['parent'] },
    children: [
      // Dashboard Parent - Default route
      {
        path: '',
        loadComponent: () => import('./pages/parent/parent-dashboard.component')
          .then(m => m.ParentDashboardComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/parent/notifications/notifications-list.component')
          .then(m => m.NotificationsListComponent)
      },

      {
        path: 'enfants',
        loadComponent: () => import('./pages/parent/parent-enfants-list.component')
          .then(m => m.ParentEnfantsListComponent)
      },
      {
        path: 'enfants/:id',
        loadComponent: () => import('./pages/parent/enfants/parent-enfant-fiche.component')
          .then(m => m.ParentEnfantFicheComponent)
      },

      // ─────── ENFANTS & PRÉSENCES ───────
      {
        path: 'enfants/:enfantId/presences',
        loadComponent: () => import('./pages/parent/presences/parent-presences-enfant.component')
          .then(m => m.ParentPresencesEnfantComponent)
      },
      {
        path: 'enfants/:enfantId/presences/calendrier',
        loadComponent: () => import('./pages/parent/presences/parent-presences-calendrier.component')
          .then(m => m.ParentPresencesCalendrierComponent)
      },
      /*{
        path: 'enfants/:enfantId/bulletin',
        loadComponent: () => import('./pages/parent/bulletin/parent-bulletin.component')
          .then(m => m.ParentBulletinComponent)
      },*/
      {
        path: 'emploi',
        loadComponent: () => import('./pages/parent/emploi/parent-emploi.component')
          .then(m => m.ParentEmploiComponent)
      },

      // ─────── ACTIVITÉS PARENT ───────
      {
        path: 'activites',
        children: [
          // Vue principale : Activités disponibles pour inscription
          {
            path: '',
            loadComponent: () => import('./pages/parent/activites/parent-activites-disponibles.component')
              .then(m => m.ParentActivitesDisponiblesComponent)
          },

          // Liste des enfants avec leurs statistiques d'activités
          {
            path: 'enfants',
            loadComponent: () => import('./pages/parent/activites/parent-enfants-activites.component')
              .then(m => m.ParentEnfantsActivitesComponent)
          },

          // Historique des activités d'un enfant spécifique
          {
            path: 'enfant/:id/historique',
            loadComponent: () => import('./pages/parent/activites/parent-enfant-historique.component')
              .then(m => m.ParentEnfantHistoriqueComponent)
          },

          // Calendrier des activités d'un enfant spécifique
          {
            path: 'enfant/:id/calendrier',
            loadComponent: () => import('./pages/parent/activites/parent-enfant-calendrier.component')
              .then(m => m.ParentEnfantCalendrierComponent)
          }
        ]
      },
      {
        path: 'menus',
        loadComponent: () => import('./pages/parent/menus/parent-menus.component')
          .then(m => m.ParentMenusComponent)
      },

      // ─────── PAIEMENTS ───────
      /*{
        path: 'paiements',
        loadComponent: () => import('./pages/parent/paiements/parent-paiements.component')
          .then(m => m.ParentPaiementsComponent)
      }*/
    ]
  },

  // ==================== FALLBACK ====================
  { path: '**', redirectTo: 'login' }
];