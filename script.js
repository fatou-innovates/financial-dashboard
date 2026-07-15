/* ===== Taux de change: combien vaut 1 XOF dans chaque devise ===== */
/* XOF est la devise pivot: on passe toujours par elle pour convertir */
const RATES_PER_XOF = {
  XOF: 1,
  EUR: 1 / 655.957,   // taux fixe reel (franc CFA arrime a l'euro)
  USD: 1 / 610,       // taux indicatif, a mettre a jour manuellement
  GBP: 1 / 770        // taux indicatif, a mettre a jour manuellement
};

/* Nombre de decimales a afficher selon la devise */
const CURRENCY_DECIMALS = {
  XOF: 0,
  EUR: 2,
  USD: 2,
  GBP: 2
};

/* ===== Fonction de calcul: convertit un montant d'une devise a une autre ===== */
function convert(amount, from, to) {
  if (isNaN(amount)) return 0; // securite si l'utilisateur tape du texte invalide

  // Etape 1: on convertit le montant vers XOF (la devise pivot)
  const amountInXOF = amount / RATES_PER_XOF[from];

  // Etape 2: on convertit ce montant XOF vers la devise cible
  const result = amountInXOF * RATES_PER_XOF[to];

  return result;
}

/* ===== Formatage: affiche le nombre avec espaces + virgule a la francaise ===== */
function formatAmount(value, currency) {
  const decimals = CURRENCY_DECIMALS[currency];
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/* ===== Branche un convertisseur: ecoute les changements et met a jour le resultat ===== */
function initConverter(root) {
  if (!root) return; // pas de convertisseur sur cette page, on arrete

  // Recupere les champs du convertisseur via leurs attributs data-role
  const amountInput = root.querySelector('[data-role="amount-input"]');
  const fromSelect = root.querySelector('[data-role="from-select"]');
  const toSelect = root.querySelector('[data-role="to-select"]');
  const resultOutput = root.querySelector('[data-role="result-output"]');
  const swapBtn = root.querySelector('[data-role="swap-btn"]');

  // Fonction appelee a chaque changement: recalcule et affiche le resultat
  function recalculate() {
    // Nettoie l'entree: enleve les espaces, remplace la virgule par un point
    const amount = parseFloat(amountInput.value.replace(/\s/g, '').replace(',', '.'));
    const from = fromSelect.value;
    const to = toSelect.value;

    const result = convert(amount, from, to);
    resultOutput.value = formatAmount(result, to) + ' ' + to;
  }

  // Recalcule a chaque frappe ou changement de devise
  amountInput.addEventListener('input', recalculate);
  fromSelect.addEventListener('change', recalculate);
  toSelect.addEventListener('change', recalculate);

  // Bouton d'inversion: echange les deux devises selectionnees
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const tmp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = tmp;
      recalculate();
    });
  }

  recalculate(); // calcul initial au chargement de la page
}

/* ===== Formulaire de connexion: redirige vers le dashboard (pas de vraie authentification) ===== */
function initLoginForm(form) {
  if (!form) return; // pas de formulaire de login sur cette page, on arrete

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // empeche le rechargement par defaut de la page
    window.location.href = 'dashboard.html';
  });
}

/* ===== Point de depart: lance tout une fois la page chargee ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Active tous les convertisseurs presents sur la page (il peut y en avoir plusieurs)
  document.querySelectorAll('[data-widget="converter"]').forEach(initConverter);

  // Active le formulaire de login s'il existe sur cette page
  initLoginForm(document.querySelector('[data-form="login"]'));
});