// ===== 安全儲存（localStorage 被擋時用記憶體備援） =====
const memoryStore = {};
function safeGet(key){ try { return localStorage.getItem(key); } catch { return memoryStore[key] ?? null; } }
function safeSet(key,val){ try { localStorage.setItem(key,val); } catch { memoryStore[key]=val; } }

// 初值
let voteData;
try { voteData = JSON.parse(safeGet('urbanVoteData')) || null; } catch { voteData = null; }
if(!voteData){
  voteData = {proposal1:0,proposal2:0,proposal3:0,proposal4:0,proposal5:0,proposal6:0,proposal7:0,proposal8:0,proposal9:0,proposal10:0,proposal11:0};
  safeSet('urbanVoteData', JSON.stringify(voteData));
}
let commentsData;
try { commentsData = JSON.parse(safeGet('urbanCommentsData')) || []; } catch { commentsData = []; }

let voteChart;

document.addEventListener('DOMContentLoaded', () => {
  // 綁定所有投票按鈕
  document.querySelectorAll('.vote-btn').forEach(btn=>{
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      voteData[`proposal${id}`] = (voteData[`proposal${id}`] || 0) + 1;
      safeSet('urbanVoteData', JSON.stringify(voteData));
      updateChart();
      alert('感謝您的投票！');
    });
  });

  // 留言送出
  document.getElementById('comment-submit').addEventListener('click', () => {
    const sel = document.getElementById('comment-proposal-select');
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if(!text){ alert('請輸入留言內容！'); return; }
    const newComment = {
      id: Date.now(),
      proposalId: sel.value,
      proposalName: sel.options[sel.selectedIndex].text,
      text
    };
    commentsData.unshift(newComment);
    safeSet('urbanCommentsData', JSON.stringify(commentsData));
    renderComments();
    input.value='';
  });

  renderChart();
  renderComments();
});

function renderComments(){
  const wall = document.getElementById('comments-wall');
  if(!commentsData.length){
    wall.innerHTML = '<p class="text-gray-500 text-center">目前尚無留言</p>';
    return;
  }
  wall.innerHTML = commentsData.map(c => `
    <div class="bg-white p-3 rounded-md shadow-sm">
      <p class="font-semibold text-sm text-gray-800">${c.proposalName}</p>
      <p class="text-gray-600">${c.text}</p>
    </div>
  `).join('');
}

function renderChart(){
  const ctx = document.getElementById('voteChart').getContext('2d');
  const labels = [
    '[方案一：地板開裂]','[方案二：圍欄生鏽]','[方案三：門口椅子]',
    '[方案四：視野受限]','[方案五：老舊鐵門]','[方案六：器具老舊]',
    '[方案七：飲水機不足]','[方案八：腳踏車架]','[方案九：步道窄小]',
    '[方案十：燈光不足]','[方案十一：長凳不足]'
  ];
  voteChart = new Chart(ctx,{
    type:'bar',
    data:{
      labels,
      datasets:[{
        label:'票數',
        data:Object.values(voteData),
        backgroundColor:[
          'rgba(52,152,219,0.7)','rgba(46,204,113,0.7)','rgba(231,76,60,0.7)',
          'rgba(155,89,182,0.7)','rgba(241,196,15,0.7)','rgba(230,126,34,0.7)',
          'rgba(52,73,94,0.7)','rgba(26,188,156,0.7)','rgba(149,165,166,0.7)',
          'rgba(211,84,0,0.7)','rgba(192,57,43,0.7)'
        ],
        borderWidth:0
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      scales:{ y:{ beginAtZero:true, ticks:{ stepSize:1 } } },
      plugins:{ legend:{ display:false } }
    }
  });
}

function updateChart(){
  if(!voteChart) return;
  voteChart.data.datasets[0].data = Object.values(voteData);
  voteChart.update();
}
