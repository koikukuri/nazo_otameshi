// ファイル名: public/puzzle.js

// ------------------------------------------------------------------
// GitHubデモ用 ダミーデータ
// ------------------------------------------------------------------

const DUMMY_USER = {
    receptionNumber: 'A-001',
    nickname: 'コイコイ太郎',
    points: 1250,
    gender: 'male', // 'male' または 'female'
    solvedPuzzle: true // この謎を解いたかどうか
};

const DUMMY_PUZZLE = {
    id: 'PUZ03',
    title: '試練の石碑 #3 - 運命の問い',
    question: 'これは、あなたの勇気とひらめきが試される試練です。石碑に刻まれた三つの文字の謎を解き明かしてください。',
    imageUrl: 'nazo_otameshi/謎解き.svg', // GitHubのフォルダ構造に合わせた画像パス
    answer: 'こいこい', // 正解のダミー
    isCoop: true // 協力プレイが可能な謎かどうか
};

const DUMMY_HINTS = [
    {
        title: '【男性限定】形と色の謎',
        maleHolders: ['m001', 'm002'],
        femaleHolders: []
    },
    {
        title: '【女性限定】音とリズムの謎',
        maleHolders: [],
        femaleHolders: ['f001']
    },
    {
        title: '【全員】物語の断片',
        maleHolders: ['m003'],
        femaleHolders: ['f002', 'f003', 'f004']
    }
];

const DUMMY_MATCHING_ROOMS = [
    { nickname: 'あかり', gender: 'female' },
    { nickname: 'ユウナ', gender: 'female' }
];


// ------------------------------------------------------------------
// ページの初期化処理
// ------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 画面要素の取得
    const loadingOverlay = document.getElementById('loading-overlay');
    const mainContent = document.getElementById('main-content');
    const puzzleContent = document.getElementById('puzzle-content');
    const hintStatusContainer = document.getElementById('hint-status-container');
    const retryMessage = document.getElementById('retry-message');
    const coopMessage = document.getElementById('coop-message');
    const answerForm = document.getElementById('answer-form');
    const matchmakingView = document.getElementById('matchmaking-view');

    // 1. ヘッダー情報の表示
    document.getElementById('header-reception-number').textContent = DUMMY_USER.receptionNumber;
    document.getElementById('header-nickname').textContent = DUMMY_USER.nickname;
    document.getElementById('header-points').textContent = DUMMY_USER.points.toLocaleString();

    // 2. 謎のタイトルと問題文の表示
    document.getElementById('puzzle-title').textContent = DUMMY_PUZZLE.title;
    
    // 謎の画像と問題文を挿入
    puzzleContent.innerHTML = `
        <p class="text-gray-700 text-lg leading-relaxed text-center">${DUMMY_PUZZLE.question}</p>
        <div class="w-full max-w-md border-2 border-gray-300 rounded-lg overflow-hidden p-4 bg-gray-50">
            <img src="${DUMMY_PUZZLE.imageUrl}" alt="${DUMMY_PUZZLE.title}の画像" class="w-full h-auto object-contain">
        </div>
    `;

    // 3. 協力謎メッセージの表示
    if (DUMMY_PUZZLE.isCoop) {
        coopMessage.classList.remove('hidden');
        // ルーム作成ボタンのテキストを設定
        document.getElementById('create-room-button').textContent = DUMMY_USER.gender === 'male' 
            ? '💕 自分がルームを作成して待つ (女性パートナー募集)' 
            : '💕 自分がルームを作成して待つ (男性パートナー募集)';
    }

    // 4. ヒント所持状況の表示
    renderHintHolders(DUMMY_HINTS, hintStatusContainer);
    
    // 5. ページの状態切り替え (クリア済み/未クリア)
    if (DUMMY_USER.solvedPuzzle) {
        // クリア済みの場合
        retryMessage.classList.remove('hidden');
        answerForm.classList.add('hidden');
        matchmakingView.classList.remove('hidden');
        renderMatchingRooms(DUMMY_MATCHING_ROOMS);
    } else {
        // 未クリアの場合
        retryMessage.classList.add('hidden');
        answerForm.classList.remove('hidden');
        matchmakingView.classList.add('hidden');
    }

    // 6. ロード完了後の処理
    loadingOverlay.classList.add('hidden');
    mainContent.classList.remove('hidden');


    // 7. イベントリスナーの設定
    document.getElementById('submit-answer-button').addEventListener('click', handleAnswerSubmission);
    // デモ用: ルーム入室・作成ボタンのイベントリスナー
    document.getElementById('create-room-button').addEventListener('click', () => alert('【デモ】ルーム作成を実行しました。'));
    document.getElementById('available-rooms-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('join-room-button')) {
            alert(`【デモ】${e.target.dataset.nickname}さんのルームに入室します。`);
        }
    });
});

/**
 * ヒント所持者情報をHTMLに描画する
 * @param {Array} hints - ヒントの配列
 * @param {HTMLElement} container - 挿入先のコンテナ要素
 */
function renderHintHolders(hints, container) {
    container.querySelector('#hint-list-message').remove(); // "読み込み中"を削除
    
    const hintHtml = hints.map(hint => {
        // 所持者数を計算
        const totalHolders = hint.maleHolders.length + hint.femaleHolders.length;
        let holderDisplay;

        if (totalHolders === 0) {
            holderDisplay = '<span class="text-sm text-gray-500 font-bold">まだ誰も発見していません</span>';
        } else {
            // ダミーのアイコンを表示 (実際の画像パスは適宜調整してください)
            const iconPath = totalHolders > 0 
                ? (hint.maleHolders.length > 0 ? './assets/profile/m001.jpg' : './assets/profile/f001.jpg')
                : '';
            
            // 簡略化して「〇人所持」というテキスト表示のみにします
            holderDisplay = `
                <div class="flex items-center">
                    <span class="text-sm font-bold text-green-600">${totalHolders}人</span>
                    <span class="text-xs text-gray-500 ml-1">が所持中</span>
                </div>
            `;
        }

        return `
            <div class="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
                <span class="font-medium text-gray-800">${hint.title}</span>
                ${holderDisplay}
            </div>
        `;
    }).join('');

    container.insertAdjacentHTML('beforeend', hintHtml);
}

/**
 * マッチングルーム情報をHTMLに描画する
 * @param {Array} rooms - 募集中のルーム配列
 */
function renderMatchingRooms(rooms) {
    document.getElementById('lobby-status').innerHTML = `
        現在、この謎でパートナーを待っている人が <span class="text-xl font-bold text-pink-500">${rooms.length}名</span> います。
    `;

    const roomsContainer = document.getElementById('available-rooms-container');
    if (rooms.length === 0) {
        roomsContainer.innerHTML = '<p class="text-gray-500 italic">現在、募集中のルームはありません。</p>';
        return;
    }

    const roomHtml = rooms.map(room => {
        // 異性のみ募集という前提で、アイコンの色を切り替え
        const iconClass = room.gender === 'female' ? 'text-pink-600' : 'text-blue-600';
        const icon = room.gender === 'female' ? 'fas fa-venus' : 'fas fa-mars';
        const buttonColor = room.gender === 'female' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-blue-500 hover:bg-blue-600';

        return `
            <div class="p-3 bg-white border border-gray-200 rounded-lg shadow-sm flex justify-between items-center">
                <span class="font-bold ${iconClass}"><i class="${icon} mr-2"></i> ${room.nickname} さん</span>
                <button class="join-room-button ${buttonColor} text-white font-bold py-1.5 px-4 rounded-full text-sm" data-nickname="${room.nickname}">入室する</button>
            </div>
        `;
    }).join('');

    roomsContainer.innerHTML = roomHtml;
}

/**
 * 回答ボタンが押されたときの処理 (デモ用)
 */
function handleAnswerSubmission() {
    const answerInput = document.getElementById('answer-input');
    const resultMessage = document.getElementById('result-message');
    const answer = answerInput.value.trim().toLowerCase();

    // 回答が正解かどうかを判定
    if (answer === DUMMY_PUZZLE.answer) {
        resultMessage.className = 'text-center mt-4 h-6 text-green-600 font-bold';
        resultMessage.textContent = '大正解です！';
        
        // 【デモ】正解後のマッチングビューに切り替え
        setTimeout(() => {
            document.getElementById('puzzle-view').classList.add('hidden');
            document.getElementById('matchmaking-view').classList.remove('hidden');
        }, 1500);

    } else {
        resultMessage.className = 'text-center mt-4 h-6 text-red-500 font-bold';
        resultMessage.textContent = '残念！答えが違います。';
    }
}