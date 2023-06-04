const fs = require('fs');

module.exports = {
  data: {
    name: 'pw',
    description: '禁止ワードの追加・削除を行います。',
    options: [
      {
        name: 'action',
        description: 'アクションを選択してください。',
        type: 'STRING',
        choices: [
          {
            name: '追加',
            value: 'add',
          },
          {
            name: '削除',
            value: 'remove',
          },
        ],
        required: true,
      },
      {
        name: 'word',
        description: '追加または削除する禁止ワード',
        type: 'STRING',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const action = interaction.options.getString('action');
    const word = interaction.options.getString('word');
    const botOwnerID = process.env.ADMIN; // .env ファイルからボットの所有者のユーザーIDを取得する
    const serverOwnerID = interaction.guild.ownerId; // サーバーのオーナーのユーザーIDを取得する

    // ボットの所有者またはサーバーのオーナーでない場合、コマンドの実行を拒否する
    if (interaction.user.id !== botOwnerID && interaction.user.id !== serverOwnerID) {
      await interaction.reply({
        content: 'このコマンドは許可されていません。',
        ephemeral: true,
      });
      return;
    }

    // 現在の禁止ワードリストを読み込む
    const prohibitedWords = loadProhibitedWords();

    if (action === 'add') {
      // 禁止ワードを追加
      prohibitedWords.push(word);
      await interaction.reply({
        content: `禁止ワード "${word}" を追加しました。`,
        ephemeral: true,
      });
    } else if (action === 'remove') {
      // 禁止ワードを削除
      const index = prohibitedWords.indexOf(word);
      if (index !== -1) {
        prohibitedWords.splice(index, 1);
        await interaction.reply({
          content: `禁止ワード "${word}" を削除しました。`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `禁止ワード "${word}" は存在しません。`,
          ephemeral: true,
        });
      }
    }

    // 禁止ワードリストを保存
    saveProhibitedWords(prohibitedWords);
  },
};

// 禁止ワードのファイルパス
const prohibitedWordsFile = './prohibitedWords.json';

// 禁止ワードのリストを読み込む関数
function loadProhibitedWords() {
  try {
    const data = fs.readFileSync(prohibitedWordsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`禁止ワードの読み込み中にエラーが発生しました: ${error}`);
    return [];
  }
}

// 禁止ワードリストを保存する関数
function saveProhibitedWords(prohibitedWords) {
  try {
    fs.writeFileSync(prohibitedWordsFile, JSON.stringify(prohibitedWords));
  } catch (error) {
    console.error(`禁止ワードの保存中にエラーが発生しました: ${error}`);
  }
}
