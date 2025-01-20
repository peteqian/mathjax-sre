import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { SerializedMmlVisitor } from 'mathjax-full/js/core/MmlTree/SerializedMmlVisitor.js';
import 'mathjax-full/js/a11y/semantic-enrich.js';
import * as SRE from 'speech-rule-engine';
import { join } from 'path';
import { JSDOM } from 'jsdom';

let sreInitialized = false;

async function initializeSRE() {
  if (sreInitialized) return;

  const mathmapsPath = join(__dirname, '..', 'node_modules', 'speech-rule-engine', 'lib', 'mathmaps');
  console.log('Initializing SRE with mathmaps path:', mathmapsPath);

  SRE.setupEngine({
    locale: 'en',
    domain: 'clearspeak',
    style: 'default',
    json: mathmapsPath,
    speech: 'deep'
  });

  await SRE.engineReady();
  sreInitialized = true;
  console.log('SRE initialized successfully');
}

function texToMathML(tex: string): string {
  const tex2jax = new TeX({
    packages: AllPackages.filter((name) => name !== 'bussproofs'),
    inlineMath: [['\\(', '\\)']],
    displayMath: [['$$', '$$']]
  });

  const adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);

  const html = mathjax.document('', {
    InputJax: tex2jax
  });

  const node = html.convert(tex, { display: true }); // Convert TeX to internal MathML

  const visitor = new SerializedMmlVisitor();
  const mml = visitor.visitTree(node);

  return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${mml}</math>`;
}

async function convertTexToSvg(tex: string): Promise<{ svg: string; speech: string }> {
  await initializeSRE();
  console.log('\nConverting TeX:', tex);

  // Convert TeX to MathML
  console.log('Converting to MathML...');
  const mathml = texToMathML(tex);
  console.log('Generated MathML:', mathml);

  // Generate speech from MathML
  console.log('Generating speech...');
  const speech = SRE.toSpeech(mathml.trim());
  console.log('Generated speech:', speech);

  // Create SVG output
  const adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);

  const tex2svg = new TeX({
    packages: AllPackages.filter((name) => name !== 'bussproofs'),
    inlineMath: [['\\(', '\\)']],
    displayMath: [['$$', '$$']]
  });

  const svg = new SVG({
    fontCache: 'local',
    internalSpeechTitles: true
  });

  const doc = mathjax.document('', {
    InputJax: tex2svg,
    OutputJax: svg
  });

  // Convert to SVG
  const node = doc.convert(tex, { display: true });
  let svgOutput = adaptor.outerHTML(node);

  // Add accessibility attributes
  const dom = new JSDOM(svgOutput);
  const svgElement = dom.window.document.querySelector('svg');

  if (svgElement) {
    svgElement.setAttribute('aria-label', speech);
    svgElement.setAttribute('role', 'img');

    const titleElement = dom.window.document.createElement('title');
    titleElement.textContent = speech;
    svgElement.insertBefore(titleElement, svgElement.firstChild);

    const descElement = dom.window.document.createElement('desc');
    descElement.textContent = `Mathematical equation: ${speech}`;
    svgElement.insertBefore(descElement, svgElement.firstChild);

    svgOutput = svgElement.outerHTML;
  }

  return { svg: svgOutput, speech };
}

async function main() {
  try {
    // Test with various equations
    const equations = [
      'x^2 + y^2 = z^2',
      '\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
      '\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}',
      'E = mc^2'
    ];

    for (const eq of equations) {
      console.log('\n=== Processing equation:', eq, '===');
      const { svg, speech } = await convertTexToSvg(eq);
      console.log('\nFinal outputs:');
      console.log('Speech:', speech);
      console.log('SVG: ', svg);
      console.log('SVG has aria-label:', svg.includes('aria-label'));
      console.log('SVG has title:', svg.includes('<title>'));
      console.log('SVG has desc:', svg.includes('<desc>'));
      console.log('-------------------');
    }
  } catch (error) {
    console.error('Main process error:', error);
    process.exit(1);
  }
}

main();
