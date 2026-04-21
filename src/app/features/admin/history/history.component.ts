import {
  Component,
  signal,
} from '@angular/core';
import { AuditorLogsComponent } from '../../auditor/auditor-logs.component';
import { AuditorDistribuidorasComponent } from '../../auditor/auditor-distribuidoras.component';
import { AuditorPagosComponent } from '../../auditor/auditor-pagos.component';
import { AuditorProductosComponent } from '../../auditor/auditor-productos.component';

type Tab = 'logs' | 'distribuidoras' | 'pagos' | 'productos';

@Component({
  selector: 'app-history',
  imports: [
    AuditorLogsComponent,
    AuditorDistribuidorasComponent,
    AuditorPagosComponent,
    AuditorProductosComponent,
  ],
  template: `
    <div>
      <!-- Header -->
      <div class="mb-6">
        <h1 class="font-[Montserrat] text-[22px] font-extrabold text-[#1A1A2E]">Historiales</h1>
        <p class="text-[13px] text-[#6B7280] mt-0.5">Consulta el historial de actividad del sistema</p>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-[10px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,51,153,0.08)]">
        <div class="flex border-b border-[#E0E0E0] overflow-x-auto">
          @for (tab of tabs; track tab.id) {
            <button
              (click)="activeTab.set(tab.id)"
              [class]="activeTab() === tab.id
                ? 'border-b-2 border-[#003399] text-[#003399] font-semibold'
                : 'text-[#6B7280] hover:text-[#1A1A2E] border-b-2 border-transparent'"
              class="px-5 py-4 text-[13px] whitespace-nowrap transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 flex items-center gap-2"
            >
              <span [innerHTML]="tab.icon" class="w-4 h-4 flex-shrink-0"></span>
              {{ tab.label }}
            </button>
          }
        </div>

        <div class="p-6">
          <!-- Todos los tabs siempre en el DOM, solo se ocultan visualmente -->
          <!-- Esto evita que ngOnInit no se dispare al cambiar de tab -->
          <div [hidden]="activeTab() !== 'logs'">
            <app-auditor-logs />
          </div>
          <div [hidden]="activeTab() !== 'distribuidoras'">
            <app-auditor-distribuidoras />
          </div>
          <div [hidden]="activeTab() !== 'pagos'">
            <app-auditor-pagos />
          </div>
          <div [hidden]="activeTab() !== 'productos'">
            <app-auditor-productos />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HistoryComponent {
  activeTab = signal<Tab>('logs');

  tabs = [
    {
      id: 'logs' as Tab,
      label: 'Log de actividad',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    },
    {
      id: 'distribuidoras' as Tab,
      label: 'Distribuidoras',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
    },
    {
      id: 'pagos' as Tab,
      label: 'Pagos y relaciones',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
    },
    {
      id: 'productos' as Tab,
      label: 'Productos',
      icon: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>`,
    },
  ];
}
