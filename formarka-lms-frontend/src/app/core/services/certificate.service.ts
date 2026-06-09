import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Certificate {
  id: number;
  courseTitle: string;
  studentName: string;
  issueDate: string;
  certificateCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/certificates`;

  getCertificate(courseId: string | number): Observable<Certificate> {
    const numericCourseId = typeof courseId === 'string' ? parseInt(courseId) : courseId;
    return this.http.get<Certificate>(`${this.apiUrl}/course/${numericCourseId}`);
  }

  downloadCertificate(certificate: Certificate): void {
    // In a real app, this would generate a PDF or download a file.
    // For now, we'll simulate by printing or opening a simplified view.
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Certificado - ${certificate.courseTitle}</title>
            <style>
              body { font-family: 'Arial', sans-serif; text-align: center; padding: 50px; border: 10px solid #f0b429; margin: 20px; }
              h1 { color: #2d3748; font-size: 48px; }
              .name { font-size: 32px; font-weight: bold; margin: 20px 0; }
              .course { font-size: 24px; font-style: italic; }
              .date { margin-top: 40px; }
              .code { font-size: 12px; color: #718096; margin-top: 50px; }
            </style>
          </head>
          <body>
            <h1>Certificado de Finalización</h1>
            <p>Se otorga el presente certificado a:</p>
            <div class="name">${certificate.studentName}</div>
            <p>Por haber completado satisfactoriamente el curso:</p>
            <div class="course">${certificate.courseTitle}</div>
            <div class="date">Fecha de emisión: ${new Date(certificate.issueDate).toLocaleDateString()}</div>
            <div class="code">Código de verificación: ${certificate.certificateCode}</div>
            <button onclick="window.print()" style="margin-top: 30px; padding: 10px 20px; background: #f0b429; border: none; cursor: pointer; font-weight: bold;">Imprimir Certificado</button>
          </body>
        </html>
      `);
      win.document.close();
    }
  }
}
