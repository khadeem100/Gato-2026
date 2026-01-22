<script lang="ts">
  import { onMount } from 'svelte';
  
  let isOpen = $state(false);
  let currentStep = $state(0);
  let formData = $state({
    bedrijfsnaam: '',
    contactpersoon: '',
    email: '',
    telefoon: '',
    producten: '',
    aantal: '',
    druktechniek: '',
    levertijd: '',
    budget: '',
    opmerkingen: '',
    hasLogo: 'ja',
    logoFile: null as File | null
  });

  const steps = [
    { title: 'Bedrijfsgegevens', description: 'Vertel ons over uw bedrijf', fields: ['bedrijfsnaam', 'contactpersoon', 'email', 'telefoon'] },
    { title: 'Productinformatie', description: 'Welke producten wilt u laten bedrukken?', fields: ['producten', 'aantal', 'druktechniek'] },
    { title: 'Logo & Design', description: 'Upload uw logo of design', fields: ['hasLogo', 'logoFile'] },
    { title: 'Planning & Budget', description: 'Wanneer heeft u de producten nodig?', fields: ['levertijd', 'budget', 'opmerkingen'] }
  ];

  const druktechnieken = ['Zeefdruk', 'Borduren', 'DTG Print', 'Flex Print', 'Flock Print', 'Sublimatie', 'Transfer', 'Laser Graveren', 'UV Print'];

  export function open() {
    isOpen = true;
    currentStep = 0;
  }

  onMount(() => {
    (window as any).openOfferteOnboarding = () => {
      isOpen = true;
      currentStep = 0;
      turnstileToken = '';
    };
    
    // Load Turnstile script
    if (!document.querySelector('script[src*="turnstile"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => { turnstileLoaded = true; };
      document.head.appendChild(script);
    } else {
      turnstileLoaded = true;
    }
    
    // Callback for Turnstile
    (window as any).onTurnstileSuccess = (token: string) => {
      turnstileToken = token;
    };
    
    return () => { 
      delete (window as any).openOfferteOnboarding;
      delete (window as any).onTurnstileSuccess;
    };
  });

  function close() { isOpen = false; currentStep = 0; }
  function nextStep() { if (currentStep < steps.length - 1) currentStep++; }
  function prevStep() { if (currentStep > 0) currentStep--; }

  async function submitForm() {
    if (!turnstileToken) {
      alert('Voltooi eerst de beveiligingscontrole.');
      return;
    }
    
    isSubmitting = true;
    
    try {
      const response = await fetch('/api/offerte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          turnstileToken
        }),
      });
      
      if (response.ok) {
        alert('Bedankt! Uw offerte aanvraag is verzonden. Wij nemen binnen 24 uur contact met u op.');
        close();
        formData = { bedrijfsnaam: '', contactpersoon: '', email: '', telefoon: '', producten: '', aantal: '', druktechniek: '', levertijd: '', budget: '', opmerkingen: '', hasLogo: 'ja', logoFile: null };
        turnstileToken = '';
      } else {
        const errorData = await response.json();
        if (errorData.error === 'Turnstile verification failed') {
          alert('Beveiligingscontrole mislukt. Probeer het opnieuw.');
        } else {
          alert('Er is iets misgegaan. Probeer het opnieuw of neem contact met ons op.');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Er is iets misgegaan. Probeer het opnieuw of neem contact met ons op.');
    } finally {
      isSubmitting = false;
    }
  }

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) formData.logoFile = target.files[0];
  }

  function isStepValid(step: number): boolean {
    const currentFields = steps[step].fields;
    return currentFields.every(field => {
      if (field === 'logoFile' && formData.hasLogo === 'nee') return true;
      if (field === 'hasLogo') return true;
      return formData[field as keyof typeof formData] !== '';
    });
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f6f1] p-4" onclick={close}>
    <div 
      class="bg-white rounded-2xl shadow-xl w-full max-w-[400px] overflow-hidden"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header - White with golden accent -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Offerte Aanvragen</h2>
            <p class="text-sm text-gray-500 mt-1">Stap {currentStep + 1} van {steps.length} — {steps[currentStep].title}</p>
          </div>
          <button 
            onclick={close} 
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Progress bar -->
        <div class="flex gap-1.5">
          {#each steps as step, i}
            <div class="flex-1 h-1 rounded-full {i <= currentStep ? 'bg-[#f5b21a]' : 'bg-gray-200'} transition-colors"></div>
          {/each}
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 max-h-[60vh] overflow-y-auto">
        {#if currentStep === 0}
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Bedrijfsnaam *</label>
              <input type="text" bind:value={formData.bedrijfsnaam} class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f5b21a] focus:border-[#f5b21a] outline-none transition-all" placeholder="Uw bedrijfsnaam" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Contactpersoon *</label>
              <input type="text" bind:value={formData.contactpersoon} class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f5b21a] focus:border-[#f5b21a] outline-none transition-all" placeholder="Voor- en achternaam" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">E-mailadres *</label>
              <input type="email" bind:value={formData.email} class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f5b21a] focus:border-[#f5b21a] outline-none transition-all" placeholder="uw@email.nl" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Telefoonnummer *</label>
              <input type="tel" bind:value={formData.telefoon} class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f5b21a] focus:border-[#f5b21a] outline-none transition-all" placeholder="+31 6 12345678" />
            </div>
          </div>
        {/if}

        {#if currentStep === 1}
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Welke producten? *</label>
              <textarea bind:value={formData.producten} rows="3" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f5b21a] focus:border-[#f5b21a] outline-none transition-all resize-none" placeholder="Bijv. T-shirts, polo's, jassen..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Aantal stuks *</label>
              <input type="text" bind:value={formData.aantal} class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f5b21a] focus:border-[#f5b21a] outline-none transition-all" placeholder="Bijv. 50 stuks" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Druktechniek *</label>
              <select bind:value={formData.druktechniek} class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f5b21a] focus:border-[#f5b21a] outline-none transition-all bg-white">
                <option value="">Selecteer een druktechniek</option>
                {#each druktechnieken as techniek}
                  <option value={techniek}>{techniek}</option>
                {/each}
                <option value="Weet ik niet">Advies gewenst</option>
              </select>
            </div>
          </div>
        {/if}

        {#if currentStep === 2}
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Heeft u al een logo? *</label>
              <div class="flex gap-3">
                <label class="flex-1 cursor-pointer">
                  <input type="radio" bind:group={formData.hasLogo} value="ja" class="peer sr-only" />
                  <div class="px-4 py-3 border-2 border-gray-200 rounded-lg text-center font-medium peer-checked:border-[#f5b21a] peer-checked:bg-[#fff9e6] transition-all">
                    Ja
                  </div>
                </label>
                <label class="flex-1 cursor-pointer">
                  <input type="radio" bind:group={formData.hasLogo} value="nee" class="peer sr-only" />
                  <div class="px-4 py-3 border-2 border-gray-200 rounded-lg text-center font-medium peer-checked:border-[#f5b21a] peer-checked:bg-[#fff9e6] transition-all">
                    Nee, hulp nodig
                  </div>
                </label>
              </div>
            </div>
            {#if formData.hasLogo === 'ja'}
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Upload logo (optioneel)</label>
                <input type="file" onchange={handleFileChange} accept="image/*,.pdf,.ai,.eps" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-[#f5b21a] file:text-white file:font-medium file:cursor-pointer cursor-pointer" />
              </div>
            {:else}
              <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                Geen probleem! Ons design team helpt u graag.
              </div>
            {/if}
          </div>
        {/if}

        {#if currentStep === 3}
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Gewenste levertijd *</label>
              <input type="text" bind:value={formData.levertijd} class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f5b21a] focus:border-[#f5b21a] outline-none transition-all" placeholder="Bijv. binnen 2 weken" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Indicatief budget *</label>
              <input type="text" bind:value={formData.budget} class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f5b21a] focus:border-[#f5b21a] outline-none transition-all" placeholder="Bijv. €500 - €1000" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Opmerkingen</label>
              <textarea bind:value={formData.opmerkingen} rows="3" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f5b21a] focus:border-[#f5b21a] outline-none transition-all resize-none" placeholder="Specifieke wensen of vragen?"></textarea>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 flex justify-between gap-3">
        <button
          onclick={prevStep}
          disabled={currentStep === 0}
          class="px-5 py-2.5 rounded-lg font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Vorige
        </button>
        
        {#if currentStep < steps.length - 1}
          <button
            onclick={nextStep}
            disabled={!isStepValid(currentStep)}
            class="px-6 py-2.5 rounded-lg font-medium bg-[#f5b21a] text-white hover:bg-[#d99b15] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Volgende
          </button>
        {:else}
          <button
            onclick={submitForm}
            disabled={!isStepValid(currentStep) || !turnstileToken || isSubmitting}
            class="px-6 py-2.5 rounded-lg font-medium bg-[#f5b21a] text-white hover:bg-[#d99b15] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {#if isSubmitting}
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verzenden...
            {:else}
              Verstuur Aanvraag
            {/if}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
