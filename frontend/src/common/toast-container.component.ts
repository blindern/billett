import { NgClass } from "@angular/common"
import { Component, inject } from "@angular/core"
import { ToastService } from "./toast.service"

@Component({
  selector: "billett-toast-container",
  standalone: true,
  imports: [NgClass],
  template: `
    <style>
      .toast-container {
        position: fixed;
        z-index: 2000;
        margin-top: 20px;
        width: 100%;
        height: 0;
        text-align: center;
        pointer-events: none;
        > ul {
          display: flex;
          align-items: center;
          flex-direction: column;
          list-style-type: none;
          margin: 0;
          padding: 0;
          > li {
            pointer-events: auto;
          }
        }
      }
    </style>
    <div class="toast-container">
      <ul>
        @for (toast of toastService.toasts; track toast.id) {
          <li>
            <div
              class="alert"
              [ngClass]="'alert-' + toast.type"
              (click)="toast.remove()"
            >
              @if (toast.unsafeHtml) {
                <div [innerHTML]="toast.content"></div>
              } @else {
                {{ toast.content }}
              }
            </div>
          </li>
        }
      </ul>
    </div>
  `,
})
export class ToastContainerComponent {
  toastService = inject(ToastService)
}
