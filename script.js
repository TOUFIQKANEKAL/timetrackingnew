let quadrants = ['white','yellow','dtl','ai'];
let quadrantLabels = {
  white:'Kaizen White Belt',
  yellow:'Kaizen Yellow Belt',
  dtl:'DTL (Dare To Lead)',
  ai:'AI Academy'
};

let employees = [
  {name:'Asha Patel', white:'done', yellow:'progress', dtl:'not', ai:'progress', comments:''},
  {name:'Ravi Kumar', white:'progress', yellow:'not', dtl:'not', ai:'not', comments:''},
  {name:'Sara Lopez', white:'done', yellow:'done', dtl:'progress', ai:'done', comments:''},
  {name:'Ram', white:'not', yellow:'not', dtl:'not', ai:'not', comments:''},
  {name:'Shiva', white:'not', yellow:'not', dtl:'not', ai:'not', comments:''},
  {name:'Krishna', white:'not', yellow:'not', dtl:'not', ai:'not', comments:''},
  {name:'Sai', white:'not', yellow:'not', dtl:'not', ai:'not', comments:''}
];

const tableBody = document.getElementById('tableBody');
const tabsContainer = document.getElementById('tabs');
let currentTab = 'white';

function statusLabel(s){
  if(s==='done') return '<span class="status-pill s-done">Completed</span>';
  if(s==='progress') return '<span class="status-pill s-progress">In Progress</span>';
  return '<span class="status-pill s-not">Not Started</span>';
}

function renderTabs(){
  tabsContainer.innerHTML = '';
  quadrants.forEach(q=>{
    const div = document.createElement('div');
    div.className = 'tab'+(q===currentTab?' active':'');
    div.textContent = quadrantLabels[q]||q;
    div.dataset.tab=q;
    div.onclick = ()=>{currentTab=q; render();};
    tabsContainer.appendChild(div);
  });
}

function render(){
  renderTabs();
  tableBody.innerHTML = '';
  employees.forEach((emp,idx)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${emp.name}</td>
      <td>${statusLabel(emp[currentTab]||'not')}</td>
      <td>${emp.comments||''}</td>
      <td><button class='btn-edit' onclick='editEmployee(${idx})'>Edit</button></td>
      <td><button class='btn-delete' onclick='deleteEmployee(${idx})'>Delete</button></td>
    `;
    tableBody.appendChild(tr);
  });
}

function editEmployee(i){
  const emp = employees[i];
  
  // Status dropdown
  const statusSelect = document.createElement('select');
  ['not','progress','done'].forEach(s=>{
    const option = document.createElement('option');
    option.value = s;
    option.text = s==='not'?'Not Started':s==='progress'?'In Progress':'Completed';
    if(emp[currentTab]===s) option.selected=true;
    statusSelect.appendChild(option);
  });

  // Comments input
  const commentInput = document.createElement('input');
  commentInput.type = 'text';
  commentInput.value = emp.comments || '';
  commentInput.placeholder = 'Enter comments';
  commentInput.style.width = '90%';

  const tdStatus = tableBody.rows[i].cells[1];
  const tdComments = tableBody.rows[i].cells[2];
  tdStatus.innerHTML = '';
  tdStatus.appendChild(statusSelect);
  tdComments.innerHTML = '';
  tdComments.appendChild(commentInput);

  function saveChanges() {
    emp[currentTab] = statusSelect.value;
    emp.comments = commentInput.value;
    render();
  }

  statusSelect.onchange = saveChanges;
  commentInput.onblur = saveChanges;
}

function deleteEmployee(i){
  if(confirm(`Are you sure to delete employee ${employees[i].name}?`)){
    employees.splice(i,1);
    render();
  }
}

function showAddEmployeeModal(){
  document.getElementById('employeeModal').style.display='flex';
}
function closeModal(id){
  document.getElementById(id).style.display='none';
}

function addEmployeeModal(){
  const name = document.getElementById('employeeName').value.trim();
  if(!name) return alert('Enter a name');
  const emp = {name, comments:''};
  quadrants.forEach(q=>emp[q]='not');
  employees.push(emp);
  render();
  document.getElementById('employeeName').value='';
  closeModal('employeeModal');
}

function showAddQuadrantModal(){
  document.getElementById('quadrantModal').style.display='flex';
}

function addQuadrantModal(){
  const key = document.getElementById('quadrantKey').value.trim();
  const label = document.getElementById('quadrantLabel').value.trim();
  if(!key || !label) return alert('Enter both key and label');
  if(quadrants.includes(key)) return alert('Key already exists');
  quadrants.push(key);
  quadrantLabels[key]=label;
  employees.forEach(e=>e[key]='not');
  currentTab=key;
  render();
  document.getElementById('quadrantKey').value='';
  document.getElementById('quadrantLabel').value='';
  closeModal('quadrantModal');
}

function deleteQuadrant(){
  const key = prompt("Enter Quadrant key to delete:");
  if(!key || !quadrants.includes(key)) { alert("Invalid key"); return; }
  if(!confirm("Are you sure you want to delete quadrant '"+quadrantLabels[key]+"'?")) return;
  quadrants = quadrants.filter(q=>q!==key);
  delete quadrantLabels[key];
  employees.forEach(e=>delete e[key]);
  currentTab = quadrants[0] || '';
  render();
}

function saveDashboard(){
  localStorage.setItem('trainingDashboard', JSON.stringify({quadrants, quadrantLabels, employees}));
  alert('Dashboard saved.');
}

function loadDashboard(){
  const saved = localStorage.getItem('trainingDashboard');
  if(!saved) return alert('No saved dashboard');
  const data = JSON.parse(saved);
  quadrants = data.quadrants;
  quadrantLabels = data.quadrantLabels;
  employees = data.employees;
  render();
}

function downloadExcel(){
  const wb = XLSX.utils.book_new();
  const ws_data = [ ['Employee', ...quadrants.map(q=>quadrantLabels[q]), 'Comments'] ];
  employees.forEach(emp=>{
    ws_data.push([emp.name, ...quadrants.map(q=>{
      const s = emp[q]||'not';
      return s.charAt(0).toUpperCase()+s.slice(1);
    }), emp.comments||'']);
  });
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, 'Training Report');
  XLSX.writeFile(wb,'training_full_report.xlsx');
}

function downloadPPT(){
  let ppt = new PptxGenJS();
  let titleSlide = ppt.addSlide();
  titleSlide.background = {fill:'7C3AED'};
  titleSlide.addText('Team Storage Tracker', {x:1, y:2, fontSize:36, color:'FFFFFF', bold:true, align:'center', w:8});

  const fillColorMap = {done:'10B981', progress:'F59E0B', not:'334155'};
  quadrants.forEach(q=>{
    let slide = ppt.addSlide();
    slide.background = {fill:'FFFFFF'};
    slide.addText(quadrantLabels[q], {x:0.5, y:0.2, fontSize:28, bold:true, color:'000000'});
    let tableData=[['Employee','Status','Comments']];
    employees.forEach(emp=>{
      tableData.push([emp.name, emp[q], emp.comments||'']);
    });
    slide.addTable(tableData,{
      x:0.5, y:1, w:9, h:5, fontSize:14, color:'000000', border:{pt:1,color:'000000'},
      fill:'F3F4F6',
      fillCell: (cell,r,c)=>{
        if(r===0) return '93C5FD';
        if(c===1) return fillColorMap[employees[r-1][q]] || '334155';
      }
    });
  });
  ppt.writeFile('training_full_report.pptx');
}

// Initial render
render();
