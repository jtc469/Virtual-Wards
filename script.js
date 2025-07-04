// Country descriptions and links 

const countryInfo = {
    
  36:  { name:"Australia",
         desc:`Every state now funds Hospital-at-Home (HaH) Care through a national activity based pricing model. The 2025 “Virtual Care Project” final report maps more than 40 hospital led services that bundle 24/7 monitoring, couriered medication and rapid response nursing, and recommends a single national dataset so that these count like an inpatient stay for funding and quality reporting.`,
         link:"https://www.ihacpa.gov.au/resources/virtual-care-project-final-report" },
  840: { name:"United States",
         desc:`The Centres for Medicare and Medicaid Services’ Acute HaH waiver allows hospitals to bill the full Medicare inpatient rates while treating people at home. By October 2024 366 hospitals in 38 states had delivered over 31,000 admissions, showing equal or lower 30 day mortality and ~20% lower post-discharge spending for many diagnosis groups. Congress has already extended the waiver once and is debating a permanent payment code.`,
         link:"https://www.cms.gov/blog/lessons-cms-acute-hospital-care-home-initiative" },
  156: { name:"China",
         desc:`Large public systems and private giants are moving fast. Guangdong Second Provincial General Hospital runs a Smart Home Ward with a virtual command centre and mobile clinical teams, while Tsinghua researchers plan an AI driven virtual hospital pilot for 2025 that will field algorithmic “doctors” across 21 specialties. Market analysts expect remote patient monitoring revenue to jump 7x in the next decade as Healthy China 2030 shifts care into homes.`,
         link:"https://reachmd.com/programs/clinicians-roundtable/ai-powered-virtual-hospital-in-china-to-launch-public-pilot-in-2025/29857/" },
  276: { name:"Germany",
         desc:`Since Jan 2022 statutory insurers reimburse remote patient monitoring for heart failure nationwide, delivered by community cardiologists and medical centres. Germany’s Digital Health Applications (“DiGA”) scheme has also approved dozens of app-based solutions, some offering continuous vital-sign streaming and escalation like single-condition virtual wards. DiGA prescriptions now top 50,000 per month.`,
         link:"https://www.digitalversorgt.de/en/news/diga-report-2024" },
  702: { name:"Singapore",
         desc:`The Ministry of Health is mainstreaming “Mobile Inpatient Care @ Home” across all public hospitals from 2025. Clinically-stable patients go home with Bluetooth devices while a central team watches real-time dashboards and dispatches clinicians if thresholds are breached. Early pilots cut inpatient stay by two days and scored near-perfect patient satisfaction.`,
         link:"https://www.moht.com.sg/our-programmes/integrated-general-hospital/mic-home" },
  208: { name:"Denmark",
         desc:`Nationwide telemonitoring for every severe COPD patient launched in Nov 2023. Municipal nurses and GPs share a portal that flags deteriorations and triggers ambulances or home visits instantly. Reform papers set similar ambitions for heart-failure and maternity care.`,
         link:"https://www.digitalhealth.net/2024/04/virtual-wards-we-are-in-danger-of-being-eclipsed-by-our-european-neighbours/" },
  724: { name:"Spain",
         desc:`Madrid’s Infanta Leonor hospital and Medtronic run “Hospital@Home”, a tech enabled service treating pneumonia, haematology cases, and fractures entirely at home. Results have convinced regional authorities to employ the model across other communities, to add “digital beds” without new bricks and mortar.`,
         link:"https://www.clinicbarcelona.org/en/service/hospital-at-home" },
  752: { name:"Sweden",
         desc:`Stockholm piloted a virtual command centre linked to mobile teams who carry ultrasound and intravenous therapies in 2023, the country’s first 24/7 virtual ward. A study reported zero safety events and a Net Promoter Score of 88, persuading other regions to copy the model.`,
         link:"https://pubmed.ncbi.nlm.nih.gov/38425246/" },
  392: { name:"Japan",
         desc:`The 2024 medical-fee revision rewards home visit nursing services that use internet connected sensors for round-the-clock vital sign surveillance. Combined with virtual ICU guidelines and a remote monitoring market that’s growing at nearly 25% per year, the foundations for full virtual wards are now embedded in national payment rules.`,
         link:"https://pubmed.ncbi.nlm.nih.gov/38425246/" },
         826: { name:"United Kingdom",
         desc:`The NHS has rolled out nationwide virtual wards, reaching ~10,500 staffed beds by September 2023 and growing to about 12,800 beds in March 2025 (roughly 20 per 100,000 people, 76 % occupied). More than 240,000 patients have already been treated at home, with studies reporting recovery to be as fast as in-hospital care and thousands of admissions avoided. A two-year independent impact evaluation began in February 2025 to guide the next expansion phase.`,
         link:"https://www.england.nhs.uk/2023/10/nhs-delivers-10000-virtual-ward-beds-target-with-hundreds-of-thousands-of-patients-treated-at-home/" }
};


const mapContainer=document.getElementById('map-container');

const svg=d3.select(mapContainer)
  .append('svg')
  .attr('viewBox','0 0 1400 840')      
  .attr('preserveAspectRatio','xMidYMid meet');

const projection=d3.geoNaturalEarth1();
const path=d3.geoPath().projection(projection);

function resize(){
  const {width,height}=mapContainer.getBoundingClientRect();
  projection.fitSize([width,height],{type:'Sphere'});
  svg.selectAll('path').attr('d',path);
}
window.addEventListener('resize',resize);

const tooltip=d3.select('#tooltip');
let   activePath=null;

function positionTooltip(cx,cy){
  const tx=cx+70, ty=cy-60;
  tooltip.style('left',`${tx}px`).style('top',`${ty}px`);
}

function showTooltip(d,element){
  const info=countryInfo[d.id];
  if(!info) return;

  if(activePath) activePath.classed('active',false);
  activePath=d3.select(element).classed('active',true);

  const [cx,cy]=path.centroid(d);
  tooltip.html(`
    <h2>${info.name}</h2>
    <p>${info.desc}</p>
    <a href="${info.link}" target="_blank" rel="noopener">Read More →</a>
  `);
  positionTooltip(cx,cy);
  tooltip.classed('show',true);
}

function hideTooltip(){
  tooltip.classed('show',false);
  if(activePath) activePath.classed('active',false);
  activePath=null;
}

tooltip.on('mouseleave',hideTooltip);

const isTouch='ontouchstart'in window;

d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
  .then(topology=>{
    const countries=topojson
      .feature(topology,topology.objects.countries)
      .features
      .filter(f=>f.properties.name!=='Antarctica');

    svg.selectAll('path')
      .data(countries)
      .enter().append('path')
      .attr('d',path)
      .attr('class',d=>countryInfo[d.id]?'country highlight':'country')
      .on(isTouch?'touchstart':'mouseenter',function(event,d){
        showTooltip(d,this);
        if(isTouch) event.preventDefault();       // stop double-tap zoom
      })
      .on(isTouch?'touchmove':'mousemove',function(event,d){
        if(activePath){
          const [cx,cy]=path.centroid(d);
          positionTooltip(cx,cy);
        }
      })
      .on(isTouch?'touchend':'mouseleave',()=>{
        if(!isTouch || !tooltip.node().matches(':hover')) hideTooltip();
      });

    resize();  // first fit after paths exist
  });

const zoom=d3.zoom()
  .scaleExtent([1,8])
  .on('zoom',event=>{
    svg.selectAll('path').attr('transform',event.transform);
  });

svg.call(zoom);
