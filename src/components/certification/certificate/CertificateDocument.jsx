'use client';
/* eslint-disable @next/next/no-img-element */
// Issuer logos and signatures are arbitrary user-supplied URLs rendered inside a fixed-size
// print-accurate document — next/image would need every host allowlisted and can rewrite the
// intrinsic box, which the layout depends on. Plain <img> matches the reference template.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import '@/css/certificate.css';

/**
 * The certificate document itself — a faithful port of the reference template
 * (nourishdoc-certificate-v5.html). All copy arrives already formatted from the
 * backend payload; this component only lays it out, shrinks the name/course to
 * fit their boxes, and scales the whole fixed-size page down to the viewport.
 *
 * Rendering the page at a fixed pixel size and scaling with a transform (rather
 * than fluid units) keeps screen and print pixel-identical.
 */

const PAPER = {
  a4: { w: 1123, h: 794, page: '297mm 210mm' },
  letter: { w: 1056, h: 816, page: '11in 8.5in' },
};

export const PAPER_OPTIONS = [
  { value: 'a4', label: 'A4 landscape (297 × 210 mm)' },
  { value: 'letter', label: 'US Letter landscape (11 × 8.5 in)' },
];

const formatIssueDate = value => {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/** Shrink an element's font until its text fits the parent's content box (mirrors the
 *  template's fitText: nowrap text only, so scrollWidth reflects the real text width). */
const fitText = (el, min) => {
  if (!el || !el.parentElement) return;
  el.style.fontSize = '';
  let size = parseFloat(getComputedStyle(el).fontSize);
  const parent = el.parentElement;
  const cs = getComputedStyle(parent);
  const box = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  while (el.scrollWidth > box && size > min) {
    size -= 1;
    el.style.fontSize = `${size}px`;
  }
};

const Seal = ({ certType, platformLogo, platformName }) => {
  // The centre medallion carries the platform wordmark (the same PNG the Brevo email templates
  // use). If it ever 404s we drop back to the typeset name rather than leaving a blank seal.
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(platformLogo) && !logoFailed;

  return (
    <svg className="nd-cert-seal" viewBox="0 0 200 200" role="img" aria-label="Wellness for everyone seal">
      <defs>
        <path id="nd-cert-arc-top" d="M 32,100 A 68,68 0 0 1 168,100" />
        <path id="nd-cert-arc-bottom" d="M 22,100 A 78,78 0 0 0 178,100" />
      </defs>
      <circle cx="100" cy="100" r="97" fill="#FFFFFF" />
      <circle cx="100" cy="100" r="98" fill="none" stroke="#FF8C00" strokeWidth="3" />
      <circle
        cx="100"
        cy="100"
        r="93"
        fill="none"
        stroke="#FF8C00"
        strokeWidth="2.4"
        strokeDasharray="0.1 5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="100" r="87" fill="none" stroke="#006400" strokeWidth="1" />
      <circle cx="100" cy="100" r="59" fill="#FFF7EE" stroke="#FF8C00" strokeWidth="1.5" />
      <text
        fontFamily="DM Sans, sans-serif"
        fontSize="11.5"
        fontWeight="600"
        letterSpacing="2.6"
        fill="#006400"
        textAnchor="middle"
      >
        <textPath href="#nd-cert-arc-top" startOffset="50%">
          WELLNESS FOR EVERYONE
        </textPath>
      </text>
      <text
        id="nd-cert-seal-bottom"
        fontFamily="DM Sans, sans-serif"
        fontSize="11.5"
        fontWeight="600"
        letterSpacing="2.6"
        fill="#006400"
        textAnchor="middle"
      >
        <textPath href="#nd-cert-arc-bottom" startOffset="50%">
          {(certType || '').toUpperCase()}
        </textPath>
      </text>
      {showLogo ? (
        <image
          href={platformLogo}
          x="54"
          y="80.4"
          width="92"
          height="39.2"
          preserveAspectRatio="xMidYMid meet"
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <text
          x="100"
          y="106"
          textAnchor="middle"
          fontFamily="Playfair Display, serif"
          fontSize="19"
          fontWeight="600"
          fill="#006400"
        >
          {platformName || 'NourishDoc'}
        </text>
      )}
    </svg>
  );
};

const CertificateDocument = ({ data, paper = 'a4' }) => {
  const fitRef = useRef(null);
  const docRef = useRef(null);
  const nameRef = useRef(null);
  const courseRef = useRef(null);
  const [scale, setScale] = useState(1);

  const { w, h, page } = PAPER[paper] || PAPER.a4;

  // Scale the fixed-size page down to the viewport width, exactly like the template's
  // scaleToFit — never up, so a wide screen still shows a 1:1 certificate.
  useEffect(() => {
    const update = () => setScale(Math.min(1, (window.innerWidth - 24) / w));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [w]);

  // Names and course titles vary wildly in length; fit them once fonts are ready and
  // again whenever the box changes size (resize, paper switch, late-loading webfont).
  useLayoutEffect(() => {
    const refit = () => {
      fitText(nameRef.current, 28);
      fitText(courseRef.current, 18);
    };
    refit();

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(refit);
    }
    const observer = new ResizeObserver(refit);
    if (fitRef.current) observer.observe(fitRef.current);
    window.addEventListener('resize', refit);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', refit);
    };
  }, [data, paper, scale]);

  if (!data) return null;

  const hasLogo = Boolean(data.logoSrc);
  const hasSignature = Boolean(data.signSrc);

  return (
    <div className="nd-cert-print-root nd-cert-vars">
      {/* @page is dynamic (A4 vs Letter) and must live in the DOM, not a stylesheet. */}
      <style dangerouslySetInnerHTML={{ __html: `@page{size:${page};margin:0}` }} />

      <div className="nd-cert-stage">
        <div
          className="nd-cert-fit"
          ref={fitRef}
          style={{ '--nd-w': `${w}px`, '--nd-h': `${h}px`, width: w * scale, height: h * scale }}
        >
          <article
            className="nd-cert-doc"
            ref={docRef}
            aria-label="Certificate of completion"
            style={{ '--nd-w': `${w}px`, '--nd-h': `${h}px`, transform: `scale(${scale})` }}
          >
            <div className="nd-cert-stack">
              <div className="nd-cert-top">
                <div className="nd-cert-col">
                  <div className="nd-cert-p-head">
                    <div className={`nd-cert-issuer${hasLogo ? ' nd-cert-has-logo' : ''}`}>
                      {hasLogo ? <img src={data.logoSrc} alt={data.issuer || ''} /> : null}
                      <div className="nd-cert-issuer-text">{data.issuer}</div>
                    </div>
                  </div>

                  <div className="nd-cert-hero">
                    <div className="nd-cert-date">{formatIssueDate(data.date || data.issuedDate)}</div>
                    <div className="nd-cert-name" ref={nameRef}>
                      {data.recipient}
                    </div>
                    <div className="nd-cert-small">has successfully completed</div>
                    <div className="nd-cert-course" ref={courseRef}>
                      {data.course}
                    </div>
                    <div className="nd-cert-desc">{data.desc}</div>
                  </div>
                </div>

                <div className="nd-cert-ribbon">
                  <div className="nd-cert-type">{data.certType}</div>
                  <Seal certType={data.certType} platformLogo={data.platformLogo} platformName={data.platformName} />
                </div>
              </div>

              <div className="nd-cert-p-foot">
                <div className={`nd-cert-sign${hasSignature ? ' nd-cert-has-img' : ''}`}>
                  <div className="nd-cert-sign-art">
                    <span className="nd-cert-script">{data.signName}</span>
                    {hasSignature ? <img src={data.signSrc} alt={`Signature of ${data.signName || ''}`} /> : null}
                  </div>
                  <div className="nd-cert-sign-name">{data.signName}</div>
                  <div className="nd-cert-sign-title">{data.signTitle}</div>
                </div>

                <div className="nd-cert-verify">
                  <div className="nd-cert-verify-txt">
                    <strong>Verify this certificate</strong>
                    Scan the QR code or visit {data.verifyHost}
                    <br />
                    <span className="nd-cert-verify-code">Code: {data.code}</span>
                    <br />
                    Identity confirmed by {data.platformName || 'NourishDoc'}.
                  </div>
                  <div className="nd-cert-qr" aria-label="QR code to verify this certificate">
                    <QRCodeSVG value={data.verifyUrl || ''} size={72} level="M" bgColor="#FFFFFF" fgColor="#006400" marginSize={0} />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default CertificateDocument;
