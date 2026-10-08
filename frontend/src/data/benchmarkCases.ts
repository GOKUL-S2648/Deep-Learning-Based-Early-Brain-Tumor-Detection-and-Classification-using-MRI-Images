import { BenchmarkCase } from '../types/radiology';

/**
 * Draws an anatomical skull and brain parenchyma foundation on a 2D canvas context
 */
function drawBaseBrainAnatomy(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  plane: 'Axial' | 'Coronal' | 'Sagittal' = 'Axial'
) {
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  if (plane === 'Axial') {
    // Scalp & subgaleal soft tissue
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.44, h * 0.47, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3a3a3a';
    ctx.fill();

    // Calvarium (Skull bone - diploic space is bright, inner/outer table dark)
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.42, h * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1e1e1e';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.40, h * 0.43, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#555555';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Brain parenchyma
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.385, h * 0.415, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4a4d52';
    ctx.fill();

    // Interhemispheric fissure (falx cerebri)
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.38);
    ctx.lineTo(cx, cy + h * 0.38);
    ctx.strokeStyle = '#22252a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Sulcal and gyral folds
    ctx.strokeStyle = '#32363e';
    ctx.lineWidth = 1.5;
    for (let r = 0.2; r < 0.38; r += 0.05) {
      for (let angle = 0; angle < Math.PI * 2; angle += 0.28) {
        const sx = cx + Math.cos(angle) * (w * r);
        const sy = cy + Math.sin(angle) * (h * r * 1.08);
        ctx.beginPath();
        ctx.arc(sx, sy, 7, 0, Math.PI * 0.8);
        ctx.stroke();
      }
    }
  } else if (plane === 'Coronal') {
    // Coronal view base
    ctx.beginPath();
    ctx.ellipse(cx, cy - h * 0.02, w * 0.43, h * 0.44, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3a3a3a';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx, cy - h * 0.02, w * 0.39, h * 0.40, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4a4d52';
    ctx.fill();

    // Falx
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.38);
    ctx.lineTo(cx, cy + h * 0.1);
    ctx.strokeStyle = '#22252a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Skull base / sphenoid bone
    ctx.fillStyle = '#1e1e1e';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.3, cy + h * 0.28);
    ctx.lineTo(cx + w * 0.3, cy + h * 0.28);
    ctx.lineTo(cx + w * 0.15, cy + h * 0.45);
    ctx.lineTo(cx - w * 0.15, cy + h * 0.45);
    ctx.closePath();
    ctx.fill();
  }
}

export const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    id: 'case-gbm-01',
    title: 'Glioblastoma Multiforme (WHO Grade IV)',
    tag: 'High-Grade Glioma',
    classLabel: 'Class 1',
    classIndex: 1,
    biologicalNature: 'Malignant / Infiltrative',
    keyMriDefiningCharacteristic: 'Intra-axial (inside brain tissue), irregular borders, ring-enhancement, massive surrounding edema.',
    classification: 'Glioma',
    whoGrade: 'Grade IV',
    modalitySequence: 'T1-weighted Gadolinium Contrast (T1+C)',
    plane: 'Axial',
    imageSrc: '/glioblastoma.jpg',
    patient: {
      mrn: 'RAD-948102',
      name: 'Eleanor Vance',
      age: 61,
      sex: 'F',
      indication: 'Progressive left hemiparesis, cognitive blunting, new adult-onset seizure.',
      studyDate: '2026-08-14',
    },
    summary: 'Right frontotemporal intra-axial ring-enhancing lesion with central necrosis, extensive vasogenic edema, and 7.2 mm midline shift.',
    imageGenerator: (ctx, w, h) => {
      drawBaseBrainAnatomy(ctx, w, h, 'Axial');
      const cx = w / 2;
      const cy = h / 2;

      // Normal Left Lateral Ventricle (intact)
      ctx.beginPath();
      ctx.ellipse(cx + w * 0.07, cy - h * 0.02, w * 0.045, h * 0.14, 0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#181b20';
      ctx.fill();

      // Right Lateral Ventricle (compressed / effaced by mass effect)
      ctx.beginPath();
      ctx.ellipse(cx - w * 0.05, cy - h * 0.03, w * 0.015, h * 0.08, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#181b20';
      ctx.fill();

      // Bowing of Falx / Midline shift to patient's left (canvas right)
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.38);
      ctx.quadraticCurveTo(cx + 28, cy, cx, cy + h * 0.38);
      ctx.strokeStyle = '#22252a';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Vasogenic finger-like edema (Right Frontotemporal - high T2/FLAIR, hypointense on T1)
      const tx = cx - w * 0.14;
      const ty = cy - h * 0.04;
      ctx.fillStyle = 'rgba(75, 80, 95, 0.65)';
      ctx.beginPath();
      ctx.ellipse(tx, ty, w * 0.22, h * 0.22, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Surrounding hyperintense infiltrative halo
      ctx.fillStyle = 'rgba(120, 125, 140, 0.4)';
      ctx.beginPath();
      ctx.ellipse(tx, ty, w * 0.17, h * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Thick, irregular nodular ring enhancement (Hyperintense bright rim on T1+C)
      ctx.beginPath();
      ctx.ellipse(tx, ty, w * 0.13, h * 0.12, 0.2, 0, Math.PI * 2);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 14;
      ctx.stroke();

      // Internal nodular enhancement irregularities
      ctx.beginPath();
      ctx.arc(tx - 18, ty - 12, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(tx + 22, ty + 10, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Central Necrotic Cavity (Dark, non-enhancing core)
      ctx.beginPath();
      ctx.ellipse(tx, ty, w * 0.08, h * 0.07, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#23262d';
      ctx.fill();

      // Internal debris/micro-calcifications
      ctx.fillStyle = '#8e939d';
      ctx.beginPath();
      ctx.arc(tx - 6, ty + 4, 3, 0, Math.PI * 2);
      ctx.fill();
    },
    defaultAnalysis: {
      tumorDetected: true,
      classLabel: 'Class 1',
      classIndex: 1,
      biologicalNature: 'Malignant / Infiltrative',
      keyMriDefiningCharacteristic: 'Intra-axial (inside brain tissue), irregular borders, ring-enhancement, massive surrounding edema.',
      primaryClassification: 'Glioma',
      subType: 'Glioblastoma, IDH-wildtype (WHO Grade IV CNS Neoplasm)',
      whoGrade: 'Grade IV',
      confidenceScore: 97.4,
      classProbabilities: [
        { classLabel: 'Class 1', className: 'Glioma', biologicalNature: 'Malignant / Infiltrative', probability: 97.4, rationale: 'Intra-axial, irregular borders, ring-enhancement, massive surrounding edema.' },
        { classLabel: 'Class 2', className: 'Meningioma', biologicalNature: 'Typically Benign', probability: 1.4, rationale: 'Intra-axial parenchymal involvement excludes extra-axial dural meningioma.' },
        { classLabel: 'Class 3', className: 'Pituitary Tumor', biologicalNature: 'Mostly Benign Adenoma', probability: 0.8, rationale: 'Epicenter is frontotemporal, outside sella turcica.' },
        { classLabel: 'Class 0', className: 'No Tumor (Healthy)', biologicalNature: 'Normal brain tissue', probability: 0.4, rationale: 'Prominent mass effect, edema, and ring-enhancing lesion present.' },
      ],
      localization: {
        hemisphere: 'Right',
        anatomicalLobe: 'Frontotemporal White Matter',
        compartment: 'Intra-axial',
        boundingBox: { ymin: 310, xmin: 210, ymax: 640, xmax: 560 },
        dimensionsMm: { anteriorPosterior: 52, transverse: 44, craniocaudal: 48, estimatedVolumeCm3: 57.5 },
      },
      imagingFeatures: {
        signalT1: 'Heterogeneous hypointense central core with avid peripheral rim enhancement',
        signalT2Flair: 'Marked expansive hyperintensity along corona radiata',
        enhancementPattern: 'Thick, nodular, irregular peripheral ring enhancement',
        duralTailSign: false,
        perilesionalEdema: 'Severe vasogenic finger-like edema crossing subcortical U-fibers',
        centralNecrosisOrCysts: true,
        hemorrhageOrCalcification: 'Micro-hemorrhagic foci with intrinsic T1 shortening',
      },
      massEffect: {
        present: true,
        midlineShiftMm: 7.2,
        ventricularEffacement: 'Severe compression of right lateral ventricle frontal horn and body with subfalcine herniation.',
        herniationRisk: 'Subfalcine herniation (7.2 mm) and impending uncal herniation with partial right ambient cistern effacement',
      },
      differentialDiagnoses: [
        { diagnosis: 'Glioblastoma, IDH-wildtype (WHO Grade IV)', likelihoodPercentage: 97.4, keyPointsFor: 'Classic thick irregular ring-enhancing rim, central necrosis, profound infiltrative edema, older patient profile.', keyPointsAgainst: 'None' },
        { diagnosis: 'Solitary Cerebral Metastasis (Lung, Melanoma, Renal)', likelihoodPercentage: 1.8, keyPointsFor: 'Well-circumscribed ring lesion with disproportionate edema.', keyPointsAgainst: 'Infiltrative FLAIR border extends far beyond enhancing rim, favoring primary glial neoplasm.' },
        { diagnosis: 'High-Grade Anaplastic Astrocytoma (WHO Grade III)', likelihoodPercentage: 0.5, keyPointsFor: 'Infiltrative intra-axial glial mass.', keyPointsAgainst: 'Frank central necrosis and florid microvascular proliferation typical of Grade IV.' },
        { diagnosis: 'Pyogenic Brain Abscess', likelihoodPercentage: 0.3, keyPointsFor: 'Ring enhancement.', keyPointsAgainst: 'Abscess usually displays smooth T2-hypointense rim with profound central diffusion restriction (ADC dark), while GBM exhibits heterogeneous rim restricted diffusion.' },
      ],
      radiologyReport: {
        examType: 'MRI Brain with and without IV Gadolinium (T1+C Axial)',
        clinicalIndication: 'Patient 61yo female presenting with progressive left hemiparesis, cognitive blunting, new adult-onset seizure.',
        technique: 'Multiplanar axial, coronal, and sagittal imaging performed at 3.0 Tesla using T1 pre-contrast, T2-weighted, T2-FLAIR, diffusion-weighted imaging (DWI/ADC), and axial/3D post-contrast volumetric T1 MPRAGE sequences.',
        comparison: 'No prior magnetic resonance imaging of the brain available for review.',
        findings: [
          { category: 'Primary Lesion Morphology', description: 'There is a large, heterogeneous, intra-axial mass centered within the right frontotemporal white matter measuring approximately 5.2 x 4.4 x 4.8 cm. Following intravenous administration of gadolinium, the lesion exhibits thick, irregular, nodular peripheral ring enhancement surrounding a central non-enhancing area of liquefactive necrosis.' },
          { category: 'Perilesional Edema & Infiltration', description: 'Extensive surrounding vasogenic edema is present throughout the right hemisphere with finger-like extensions extending along white matter tracts into the internal capsule and right corona radiata.' },
          { category: 'Mass Effect & Herniation', description: 'Significant positive mass effect is manifested by near-complete effacement of the right lateral ventricle frontal horn and body. Leftward midline shift of 7.2 mm measured at the septum pellucidum, consistent with subfalcine herniation. Mild effacement of the ipsilateral ambient cistern, raising concern for early impending uncal compromise.' },
          { category: 'Diffusion & Vascular Architecture', description: 'Patchy restricted diffusion is noted along the hypercellular enhancing rim on DWI/ADC maps. Prominent tortuous pathological flow voids reflecting neo-angiogenesis.' },
        ],
        impression: [
          '1. Large 5.2 cm heterogeneous ring-enhancing right frontotemporal intra-axial mass with extensive necrosis and florid perilesional edema, highly suspicious for Glioblastoma, IDH-wildtype (WHO Grade IV CNS Neoplasm).',
          '2. Marked secondary mass effect with 7.2 mm leftward subfalcine midline shift and subtotal effacement of the right lateral ventricle.',
          '3. Close neurosurgical monitoring recommended due to herniation risk.',
        ],
        recommendations: [
          'STAT Neurosurgical consultation for surgical debulking / navigation-guided stereotactic resection and tissue diagnosis.',
          'Urgent neuro-intensive care initiation of IV dexamethasone (e.g. 10 mg load followed by 4 mg q6h) with gastroprotection to alleviate vasogenic edema and mass effect.',
          'Staging CT of chest, abdomen, and pelvis to exclude occult metastatic primary if clinical suspicion arises, although imaging features strongly favor primary glioma.',
          'Histopathologic and molecular genomic testing for IDH1/2 mutation status, 1p/19q co-deletion, MGMT promoter methylation, and EGFR amplification.',
        ],
        urgencyLevel: 'Emergent / STAT',
      },
    },
  },
  {
    id: 'case-men-02',
    title: 'Convexity Meningioma (WHO Grade I)',
    tag: 'Extra-Axial Neoplasm',
    classLabel: 'Class 2',
    classIndex: 2,
    biologicalNature: 'Typically Benign',
    keyMriDefiningCharacteristic: 'Extra-axial (originates outside brain tissue), sharp margins, shows a classic "dural tail" enhancement.',
    classification: 'Meningioma',
    whoGrade: 'Grade I',
    modalitySequence: 'T1-weighted Gadolinium Contrast (T1+C)',
    plane: 'Axial',
    imageSrc: '/meningioma.jpg',
    patient: {
      mrn: 'RAD-881290',
      name: 'Arthur Pendelton',
      age: 54,
      sex: 'M',
      indication: 'Intermittent localized frontoparietal tension headaches, mild left arm numbness.',
      studyDate: '2026-07-29',
    },
    summary: 'Well-circumscribed extra-axial lesion along left frontal convexity with classic dural tail sign and homogeneous avid enhancement.',
    imageGenerator: (ctx, w, h) => {
      drawBaseBrainAnatomy(ctx, w, h, 'Axial');
      const cx = w / 2;
      const cy = h / 2;

      // Both Lateral Ventricles (mild compression on left side)
      ctx.beginPath();
      ctx.ellipse(cx - w * 0.07, cy - h * 0.02, w * 0.038, h * 0.13, -0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#181b20';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx + w * 0.065, cy - h * 0.02, w * 0.032, h * 0.12, 0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#181b20';
      ctx.fill();

      // Left Frontal Convexity Extra-Axial Mass (Canvas Right)
      const mx = cx + w * 0.22;
      const my = cy - h * 0.14;

      // Dural Tail Sign (Bright enhancing tapering along inner table)
      ctx.beginPath();
      ctx.moveTo(mx - 15, my - 45);
      ctx.quadraticCurveTo(mx + 20, my - 10, mx + 5, my + 45);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.stroke();

      // CSF Cleft Sign (Thin dark crescent separating mass from brain cortex)
      ctx.beginPath();
      ctx.arc(mx - 8, my, w * 0.125, 0.6, 2.5);
      ctx.strokeStyle = '#181b20';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Homogeneous avidly enhancing mass
      ctx.beginPath();
      ctx.ellipse(mx, my, w * 0.115, h * 0.11, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();

      // Modest internal micro-vascular lobulations
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mx + 4, my - 6, 12, 0, Math.PI * 1.5);
      ctx.stroke();

      // Cortical buckling / gentle edema
      ctx.fillStyle = 'rgba(65, 70, 82, 0.4)';
      ctx.beginPath();
      ctx.ellipse(mx - 28, my + 10, w * 0.06, h * 0.08, -0.2, 0, Math.PI * 2);
      ctx.fill();
    },
    defaultAnalysis: {
      tumorDetected: true,
      classLabel: 'Class 2',
      classIndex: 2,
      biologicalNature: 'Typically Benign',
      keyMriDefiningCharacteristic: 'Extra-axial (originates outside brain tissue), sharp margins, shows a classic "dural tail" enhancement.',
      primaryClassification: 'Meningioma',
      subType: 'Convexity Meningioma (Meningothelial / Transitional, WHO Grade I)',
      whoGrade: 'Grade I',
      confidenceScore: 96.1,
      classProbabilities: [
        { classLabel: 'Class 2', className: 'Meningioma', biologicalNature: 'Typically Benign', probability: 96.1, rationale: 'Extra-axial (originates outside brain tissue), sharp margins, shows a classic "dural tail" enhancement.' },
        { classLabel: 'Class 1', className: 'Glioma', biologicalNature: 'Malignant / Infiltrative', probability: 2.3, rationale: 'Sharp CSF cleft and extra-axial cortical buckling rule out intra-axial infiltrative glioma.' },
        { classLabel: 'Class 3', className: 'Pituitary Tumor', biologicalNature: 'Mostly Benign Adenoma', probability: 1.1, rationale: 'Convexity location, not in sellar region.' },
        { classLabel: 'Class 0', className: 'No Tumor (Healthy)', biologicalNature: 'Normal brain tissue', probability: 0.5, rationale: 'Extensive 3.8 cm extra-axial mass present.' },
      ],
      localization: {
        hemisphere: 'Left',
        anatomicalLobe: 'Frontoparietal Convexity',
        compartment: 'Extra-axial',
        boundingBox: { ymin: 220, xmin: 590, ymax: 470, xmax: 820 },
        dimensionsMm: { anteriorPosterior: 38, transverse: 34, craniocaudal: 31, estimatedVolumeCm3: 20.8 },
      },
      imagingFeatures: {
        signalT1: 'Isointense to hypointense to gray matter on pre-contrast T1',
        signalT2Flair: 'Isointense with sharp peripheral CSF cleft',
        enhancementPattern: 'Intense, homogeneous contrast enhancement',
        duralTailSign: true,
        perilesionalEdema: 'Mild vasogenic edema limited to immediately adjacent cortical gyri',
        centralNecrosisOrCysts: false,
        hemorrhageOrCalcification: 'Fine punctate calcifications near dural base',
      },
      massEffect: {
        present: true,
        midlineShiftMm: 2.4,
        ventricularEffacement: 'Mild local cortical compression and slight narrowing of left lateral ventricular body.',
        herniationRisk: 'Low',
      },
      differentialDiagnoses: [
        { diagnosis: 'Benign Meningioma (WHO Grade I)', likelihoodPercentage: 96.1, keyPointsFor: 'Classic dural tail, avid enhancement, sharp CSF cleft.', keyPointsAgainst: 'None' },
        { diagnosis: 'Atypical Meningioma (WHO Grade II)', likelihoodPercentage: 2.8, keyPointsFor: 'Slight adjacent cortical edema.', keyPointsAgainst: 'No bone erosion, no heterogeneous necrosis.' },
        { diagnosis: 'Solitary Fibrous Tumor', likelihoodPercentage: 1.1, keyPointsFor: 'Dural-based lesion.', keyPointsAgainst: 'Lacks prominent serpentine vascular flow voids.' },
      ],
      radiologyReport: {
        examType: 'MRI Brain with IV Gadolinium Contrast (T1+C Axial)',
        clinicalIndication: '54yo male with persistent localized tension-type headaches and subtle sensory changes.',
        technique: 'Multiplanar high-resolution MRI of the brain including pre/post contrast volumetric T1, T2, FLAIR, and DWI/ADC.',
        comparison: 'No previous imaging studies available.',
        findings: [
          { category: 'Extra-Axial Neoplasm', description: 'Sharply circumscribed extra-axial mass measuring 3.8 x 3.4 x 3.1 cm based along the left frontoparietal dural convexity. Marked, uniform homogeneous contrast enhancement with a 1.2 cm tapering enhancing dural tail extending along the inner table of the calvarium.' },
          { category: 'Parenchymal Interface', description: 'Well-defined CSF cleft separating the mass from the underlying brain parenchyma with characteristic inward buckling of the gray-white junction. Mild surrounding vasogenic edema is present within the adjacent subcortical white matter.' },
          { category: 'Ventricular Alignment', description: 'Mild compressive indentation of the left lateral ventricular roof with 2.4 mm rightward displacement of the septum pellucidum. Basal cisterns and posterior fossa are clear.' },
        ],
        impression: [
          '1. Classic 3.8 cm extra-axial left frontoparietal convexity mass with prominent dural tail and avid homogeneous enhancement, virtually pathognomonic for Meningioma (WHO Grade I).',
          '2. Mild local mass effect with 2.4 mm midline shift and limited adjacent vasogenic edema.',
        ],
        recommendations: [
          'Neurosurgical consultation for surgical planning (Simpson Grade I resection) or consideration of stereotactic radiosurgery (Gamma Knife / CyberKnife).',
          'MR venography to assess patency of adjacent cortical bridging veins and sagittal sinus distance.',
        ],
        urgencyLevel: 'Priority',
      },
    },
  },
  {
    id: 'case-pit-03',
    title: 'Pituitary Macroadenoma (Suprasellar Extension)',
    tag: 'Sellar / Neuroendocrine',
    classLabel: 'Class 3',
    classIndex: 3,
    biologicalNature: 'Mostly Benign Adenoma',
    keyMriDefiningCharacteristic: 'Located specifically in the sella turcica (base of skull), causes optic chiasm compression.',
    classification: 'Pituitary Tumor',
    whoGrade: 'Grade I',
    modalitySequence: 'T1-weighted Contrast (Coronal)',
    plane: 'Coronal',
    imageSrc: '/pituitary.jpg',
    patient: {
      mrn: 'RAD-739104',
      name: 'Julian Henderson',
      age: 47,
      sex: 'M',
      indication: 'Bitemporal hemianopsia, decreased libido, fatigue, chronic dull frontal headaches.',
      studyDate: '2026-06-19',
    },
    summary: 'Sellar expansion with prominent waist-like suprasellar extension, optic chiasm elevation, and contact with third ventricle floor.',
    imageGenerator: (ctx, w, h) => {
      drawBaseBrainAnatomy(ctx, w, h, 'Coronal');
      const cx = w / 2;
      const cy = h / 2;

      // Sella Turcica Region (Expanded)
      const sx = cx;
      const sy = cy + h * 0.12;

      // Optic Chiasm (Compressed upward)
      ctx.beginPath();
      ctx.moveTo(sx - 28, sy - 48);
      ctx.quadraticCurveTo(sx, sy - 56, sx + 28, sy - 48);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Third Ventricle Floor (Elevated)
      ctx.beginPath();
      ctx.ellipse(sx, sy - 72, w * 0.02, h * 0.06, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#181b20';
      ctx.fill();

      // Lateral Ventricles (Coronal view)
      ctx.beginPath();
      ctx.ellipse(sx - w * 0.08, cy - h * 0.1, w * 0.035, h * 0.09, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#181b20';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(sx + w * 0.08, cy - h * 0.1, w * 0.035, h * 0.09, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#181b20';
      ctx.fill();

      // Pituitary Macroadenoma - Figure-8 / Snowman appearance
      // Lower sellar bulb
      ctx.beginPath();
      ctx.ellipse(sx, sy, w * 0.085, h * 0.075, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();

      // Suprasellar waist constriction at diaphragma sellae
      ctx.beginPath();
      ctx.ellipse(sx, sy - 34, w * 0.075, h * 0.07, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();

      // Internal subtle micro-cystic heterogeneity
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(sx - 8, sy - 14, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + 10, sy - 28, 4, 0, Math.PI * 2);
      ctx.fill();

      // Bilateral Internal Carotid Artery Flow Voids (Dark signal voids in cavernous sinus)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(sx - 38, sy - 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + 38, sy - 2, 7, 0, Math.PI * 2);
      ctx.fill();
    },
    defaultAnalysis: {
      tumorDetected: true,
      classLabel: 'Class 3',
      classIndex: 3,
      biologicalNature: 'Mostly Benign Adenoma',
      keyMriDefiningCharacteristic: 'Located specifically in the sella turcica (base of skull), causes optic chiasm compression.',
      primaryClassification: 'Pituitary Tumor',
      subType: 'Pituitary Macroadenoma (PitNET, Non-functioning or Prolactinoma)',
      whoGrade: 'Grade I',
      confidenceScore: 98.2,
      classProbabilities: [
        { classLabel: 'Class 3', className: 'Pituitary Tumor', biologicalNature: 'Mostly Benign Adenoma', probability: 98.2, rationale: 'Located specifically in the sella turcica (base of skull), causes optic chiasm compression.' },
        { classLabel: 'Class 2', className: 'Meningioma', biologicalNature: 'Typically Benign', probability: 1.1, rationale: 'Epicenter within sella rather than planum sphenoidale dura.' },
        { classLabel: 'Class 1', className: 'Glioma', biologicalNature: 'Malignant / Infiltrative', probability: 0.5, rationale: 'Circumscribed sellar mass, not intra-axial glial infiltration.' },
        { classLabel: 'Class 0', className: 'No Tumor (Healthy)', biologicalNature: 'Normal brain tissue', probability: 0.2, rationale: 'Expansile sellar neoplasm causing optic pathway displacement.' },
      ],
      localization: {
        hemisphere: 'Midline',
        anatomicalLobe: 'Sella Turcica & Suprasellar Cistern',
        compartment: 'Extra-axial',
        boundingBox: { ymin: 440, xmin: 410, ymax: 680, xmax: 590 },
        dimensionsMm: { anteriorPosterior: 24, transverse: 21, craniocaudal: 29, estimatedVolumeCm3: 7.6 },
      },
      imagingFeatures: {
        signalT1: 'Isointense to brain parenchyma with heterogeneous moderate enhancement',
        signalT2Flair: 'Isointense to mildly hyperintense with tiny microcystic foci',
        enhancementPattern: 'Heterogeneous moderate contrast enhancement',
        duralTailSign: false,
        perilesionalEdema: 'None within cerebrum',
        centralNecrosisOrCysts: true,
        hemorrhageOrCalcification: 'Micro-cystic degeneration without pituitary apoplexy',
      },
      massEffect: {
        present: true,
        midlineShiftMm: 0,
        ventricularEffacement: 'Effacement of suprasellar cistern with marked elevation and stretching of the optic chiasm.',
        herniationRisk: 'High risk of irreversible optic pathway visual loss due to chiasmal stretching',
      },
      differentialDiagnoses: [
        { diagnosis: 'Pituitary Macroadenoma (>10 mm)', likelihoodPercentage: 98.2, keyPointsFor: 'Expanded sella, figure-eight configuration through diaphragmatic hiatus, optic chiasm impingement.', keyPointsAgainst: 'None' },
        { diagnosis: 'Adamantinomatous Craniopharyngioma', likelihoodPercentage: 1.2, keyPointsFor: 'Suprasellar mass.', keyPointsAgainst: 'No calcification or multi-locular hyperintense cyst fluid.' },
        { diagnosis: 'Tuberculum Sellae Meningioma', likelihoodPercentage: 0.6, keyPointsFor: 'Suprasellar lesion near chiasm.', keyPointsAgainst: 'Pituitary gland normal tissue is displaced inferiorly/laterally, sella is remodeled.' },
      ],
      radiologyReport: {
        examType: 'Dedicated High-Resolution Pituitary MRI with Dynamic Gadolinium Contrast (Coronal T1+C)',
        clinicalIndication: '47yo male presenting with progressive bitemporal visual field loss, headache, and fatigue.',
        technique: 'Thin-section (2 mm) coronal and sagittal T1, T2, and dynamic gadolinium-enhanced acquisitions on 3.0 Tesla MRI.',
        comparison: 'None available.',
        findings: [
          { category: 'Sellar Mass', description: 'Prominent 2.9 cm (craniocaudal) expansile sellar mass eroding and remodeling the sellar floor with waist-like constriction at the diaphragma sellae ("snowman configuration") and significant extension into the suprasellar cistern.' },
          { category: 'Optic Chiasm & Visual Apparatus', description: 'The superior dome of the mass markedly elevates and drapes the optic chiasm, explaining the clinical bitemporal visual deficit. Optic tracts are mildly splayed.' },
          { category: 'Cavernous Sinuses & Vascularity', description: 'Knosp Grade 1 lateral extension towards bilateral cavernous sinuses. Bilateral internal carotid artery flow voids remain widely patent without encasement or narrowing.' },
        ],
        impression: [
          '1. Large 2.9 cm Pituitary Macroadenoma with suprasellar extension, causing marked compression and upward displacement of the optic chiasm.',
          '2. Bilateral internal carotid flow voids patent (Knosp Grade 1).',
        ],
        recommendations: [
          'Immediate neuro-ophthalmology Humphrey 24-2 visual field examination.',
          'Complete endocrine evaluation including prolactin (to rule out prolactinoma amenable to medical dopamine agonist therapy with cabergoline) and pituitary axis hormones.',
          'Neurosurgical evaluation for endoscopic endonasal transsphenoidal decompression.',
        ],
        urgencyLevel: 'Priority',
      },
    },
  },
  {
    id: 'case-norm-04',
    title: 'Normal Brain MRI Control',
    tag: 'Non-Neoplastic / Healthy',
    classLabel: 'Class 0',
    classIndex: 0,
    biologicalNature: 'Normal brain tissue',
    keyMriDefiningCharacteristic: 'Symmetric hemispheres, intact midline, no edema or lesions.',
    classification: 'No Tumor (Healthy)',
    whoGrade: 'Non-neoplastic',
    modalitySequence: 'T2-weighted Fast Spin Echo (FSE)',
    plane: 'Axial',
    imageSrc: '/normal.jpg',
    patient: {
      mrn: 'RAD-552199',
      name: 'Samantha Wright',
      age: 38,
      sex: 'F',
      indication: 'Atypical migraine screening; rule out space occupying lesion.',
      studyDate: '2026-09-02',
    },
    summary: 'Pristine intracranial architecture without neoplastic masses, restricted diffusion, or pathological enhancement.',
    imageGenerator: (ctx, w, h) => {
      drawBaseBrainAnatomy(ctx, w, h, 'Axial');
      const cx = w / 2;
      const cy = h / 2;

      // Perfectly symmetric, pristine lateral ventricles
      ctx.beginPath();
      ctx.ellipse(cx - w * 0.065, cy - h * 0.02, w * 0.038, h * 0.13, -0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff'; // Bright CSF on T2
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx + w * 0.065, cy - h * 0.02, w * 0.038, h * 0.13, 0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Third ventricle slit-like in midline
      ctx.beginPath();
      ctx.ellipse(cx, cy + h * 0.04, w * 0.012, h * 0.05, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Crisp straight midline
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.38);
      ctx.lineTo(cx, cy + h * 0.38);
      ctx.strokeStyle = '#181b20';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Sharp gray-white matter boundaries
      ctx.strokeStyle = '#3e4249';
      ctx.lineWidth = 1.2;
      for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
        ctx.beginPath();
        const rx = cx + Math.cos(angle) * (w * 0.28);
        const ry = cy + Math.sin(angle) * (h * 0.3);
        ctx.arc(rx, ry, 12, 0, Math.PI);
        ctx.stroke();
      }
    },
    defaultAnalysis: {
      tumorDetected: false,
      classLabel: 'Class 0',
      classIndex: 0,
      biologicalNature: 'Normal brain tissue',
      keyMriDefiningCharacteristic: 'Symmetric hemispheres, intact midline, no edema or lesions.',
      primaryClassification: 'No Tumor (Healthy)',
      subType: 'Normal Brain Parenchyma',
      whoGrade: 'Non-neoplastic',
      confidenceScore: 99.1,
      classProbabilities: [
        { classLabel: 'Class 0', className: 'No Tumor (Healthy)', biologicalNature: 'Normal brain tissue', probability: 99.1, rationale: 'Symmetric hemispheres, intact midline, no edema or lesions.' },
        { classLabel: 'Class 1', className: 'Glioma', biologicalNature: 'Malignant / Infiltrative', probability: 0.4, rationale: 'No intra-axial mass, no infiltrative edema.' },
        { classLabel: 'Class 2', className: 'Meningioma', biologicalNature: 'Typically Benign', probability: 0.3, rationale: 'No extra-axial lesions, dural thickening, or dural tail.' },
        { classLabel: 'Class 3', className: 'Pituitary Tumor', biologicalNature: 'Mostly Benign Adenoma', probability: 0.2, rationale: 'Normal pituitary gland size and optic chiasm configuration.' },
      ],
      localization: {
        hemisphere: 'Bilateral',
        anatomicalLobe: 'Normal Parenchyma',
        compartment: 'Intra-axial',
        boundingBox: { ymin: 0, xmin: 0, ymax: 0, xmax: 0 },
        dimensionsMm: { anteriorPosterior: 0, transverse: 0, craniocaudal: 0, estimatedVolumeCm3: 0 },
      },
      imagingFeatures: {
        signalT1: 'Normal corticomedullary contrast',
        signalT2Flair: 'No pathological hyperintensity or edema',
        enhancementPattern: 'None',
        duralTailSign: false,
        perilesionalEdema: 'None',
        centralNecrosisOrCysts: false,
        hemorrhageOrCalcification: 'Absent',
      },
      massEffect: {
        present: false,
        midlineShiftMm: 0,
        ventricularEffacement: 'None. Symmetrical frontal and occipital horns.',
        herniationRisk: 'None',
      },
      differentialDiagnoses: [
        { diagnosis: 'Normal Brain MRI Examination', likelihoodPercentage: 99.1, keyPointsFor: 'Pristine parenchymal architecture, absence of pathological mass or enhancement.', keyPointsAgainst: 'None' },
      ],
      radiologyReport: {
        examType: 'MRI Brain without Contrast (T2 Axial)',
        clinicalIndication: '38yo female with atypical headache; rule out structural intracranial abnormality.',
        technique: 'Multiplanar multisequence brain MRI protocol including axial T2-weighted FSE, FLAIR, T1, and DWI.',
        comparison: 'No priors available.',
        findings: [
          { category: 'Cerebral Hemispheres', description: 'Normal parenchymal volume, morphology, and symmetric gray-white differentiation throughout both cerebral hemispheres. No focal hyperintensities or areas of restricted diffusion.' },
          { category: 'Ventricular Architecture', description: 'Lateral, third, and fourth ventricles are normal in size, shape, and midline alignment. No hydrocephalus, no midline shift.' },
          { category: 'Posterior Fossa & Calvarium', description: 'Cerebellar hemispheres, vermis, and brainstem are unremarkable. Basilar cisterns and extra-axial CSF spaces are clear.' },
        ],
        impression: [
          '1. Normal brain MRI examination.',
          '2. No evidence of neoplasm, acute ischemia, mass effect, or structural lesion.',
        ],
        recommendations: [
          'No follow-up neuroimaging required. Outpatient clinical neurology management of primary headache disorder.',
        ],
        urgencyLevel: 'Routine',
      },
    },
  },
];
