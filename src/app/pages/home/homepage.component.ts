// homepage.component.ts
import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InscriptionService, InscriptionFormData } from '../../services/inscription.service';

interface FormDataLocal {
  nomEnfant: string;
  prenomEnfant: string;
  dateNaissance: string;
  genreEnfant: 'M' | 'F' | '';
  nomParent: string;
  prenomParent: string;
  telephone: string;
  email: string;
  adresse: string;
  profession: string;
  classeDesire: string;
  anneeScolaire: string;
  allergies: string;
  problemesSante: string;
  medicaments: string;
  contactUrgenceNom: string;
  contactUrgenceTelephone: string;
  message: string;
}

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, OnDestroy {
  showInscriptionForm = signal(false);
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  
  currentYear: string;
  nextYear: string;
  
  formData: FormDataLocal = {
    nomEnfant: '',
    prenomEnfant: '',
    dateNaissance: '',
    genreEnfant: '',
    nomParent: '',
    prenomParent: '',
    telephone: '',
    email: '',
    adresse: '',
    profession: '',
    classeDesire: '',
    anneeScolaire: '',
    allergies: '',
    problemesSante: '',
    medicaments: '',
    contactUrgenceNom: '',
    contactUrgenceTelephone: '',
    message: ''
  };

  constructor(
    private router: Router,
    private inscriptionService: InscriptionService
  ) {
    this.currentYear = this.inscriptionService.getCurrentSchoolYear();
    this.nextYear = this.inscriptionService.getNextSchoolYear();
  }

  ngOnInit() {
    this.formData.anneeScolaire = this.currentYear;
  }

  ngOnDestroy() {
    document.body.style.overflow = 'auto';
  }

  openInscriptionForm() {
    this.showInscriptionForm.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeInscriptionForm() {
    this.showInscriptionForm.set(false);
    this.submitSuccess.set(false);
    this.submitError.set(false);
    document.body.style.overflow = 'auto';
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      nomEnfant: '',
      prenomEnfant: '',
      dateNaissance: '',
      genreEnfant: '',
      nomParent: '',
      prenomParent: '',
      telephone: '',
      email: '',
      adresse: '',
      profession: '',
      classeDesire: '',
      anneeScolaire: this.currentYear,
      allergies: '',
      problemesSante: '',
      medicaments: '',
      contactUrgenceNom: '',
      contactUrgenceTelephone: '',
      message: ''
    };
  }

  getFormProgress(): number {
    const requiredFields = [
      this.formData.anneeScolaire,
      this.formData.nomEnfant,
      this.formData.prenomEnfant,
      this.formData.dateNaissance,
      this.formData.genreEnfant,
      this.formData.classeDesire,
      this.formData.nomParent,
      this.formData.prenomParent,
      this.formData.telephone,
      this.formData.email
    ];
    
    const filledFields = requiredFields.filter(field => field && field.toString().trim() !== '').length;
    return Math.round((filledFields / requiredFields.length) * 100);
  }

  isFormValid(): boolean {
    return this.getFormProgress() === 100;
  }

  private convertToArray(value: string): string[] | undefined {
    if (!value || value.trim() === '') return undefined;
    return value.split(',').map(item => item.trim()).filter(item => item);
  }

  submitInscription() {
    if (!this.isFormValid() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(false);

    const apiData: InscriptionFormData = {
      annee_scolaire: this.formData.anneeScolaire,
      niveau_souhaite: this.formData.classeDesire,
      
      nom_parent: this.formData.nomParent,
      prenom_parent: this.formData.prenomParent,
      email_parent: this.formData.email,
      telephone_parent: this.formData.telephone,
      adresse_parent: this.formData.adresse || undefined,
      profession_parent: this.formData.profession || undefined,
      
      nom_enfant: this.formData.nomEnfant,
      prenom_enfant: this.formData.prenomEnfant,
      date_naissance_enfant: this.formData.dateNaissance,
      genre_enfant: this.formData.genreEnfant as 'M' | 'F',
      
      allergies: this.convertToArray(this.formData.allergies),
      problemes_sante: this.convertToArray(this.formData.problemesSante),
      medicaments: this.convertToArray(this.formData.medicaments),
      
      contact_urgence_nom: this.formData.contactUrgenceNom || undefined,
      contact_urgence_telephone: this.formData.contactUrgenceTelephone || undefined,
      
      remarques: this.formData.message || undefined
    };

    this.inscriptionService.submitInscription(apiData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.successMessage.set(response.message || 'Votre demande d\'inscription a été envoyée avec succès! Notre équipe vous contactera sous 24h.');
        
        setTimeout(() => {
          const modal = document.querySelector('.overflow-y-auto');
          if (modal) {
            modal.scrollTop = 0;
          }
        }, 100);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.submitError.set(true);
        
        let errorMsg = 'Une erreur est survenue lors de l\'envoi de votre demande. ';
        
        if (error.error?.errors) {
          const errors = Object.values(error.error.errors).flat();
          errorMsg += errors.join(', ');
        } else if (error.error?.message) {
          errorMsg += error.error.message;
        } else {
          errorMsg += 'Veuillez réessayer plus tard ou nous contacter directement.';
        }
        
        this.errorMessage.set(errorMsg);
        
        setTimeout(() => {
          const modal = document.querySelector('.overflow-y-auto');
          if (modal) {
            modal.scrollTop = 0;
          }
        }, 100);
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}