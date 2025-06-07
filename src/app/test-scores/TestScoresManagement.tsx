'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  FaArrowLeft, 
  FaHistory,
  FaExclamationCircle,
  FaCheckCircle,
  FaSpinner,
  FaChartLine, // この行を移動
} from 'react-icons/fa'

import ScoreForm from './ScoreForm'
import EditableScoreCard from './EditableScoreCard' // 新しく追加
import EditableTotalScoreCard from './EditableTotalScoreCard' // 新しく追加
import SubjectRadarChart from './RadarChart'
import AbilityIndicator from './AbilityIndicator'

interface TestScore {
  id?: number;
  student_id?: number;
  test_name: string;
  test_definition_id: number;
  japanese_score?: number | null;
  math_score?: number | null;
  english_score?: number | null;
  science_score?: number | null;
  social_score?: number | null;
  class_rank?: number | null;
  total_score?: number | null;
  post_date?: string;
  created_at?: string;
}

interface TestDefinition {
  id: number
  school_id: number
  grade_id: number
  test_name: string
  scheduled_date: string
  first_avg_japanese: number | null
  first_avg_math: number | null
  first_avg_english: number | null
  first_avg_science: number | null
  first_avg_social: number | null
  second_avg_japanese: number | null
  second_avg_math: number | null
  second_avg_english: number | null
  second_avg_science: number | null
  second_avg_social: number | null
  third_avg_japanese: number | null
  third_avg_math: number | null
  third_avg_english: number | null
  third_avg_science: number | null
  third_avg_social: number | null
  provisional?: boolean
}

interface Notification {
  show: boolean
  message: string
  type: 'success' | 'error'
}

type ScoreField = keyof Pick<TestScore, 
  'japanese_score' | 
  'math_score' | 
  'english_score' | 
  'science_score' | 
  'social_score' | 
  'class_rank'
>

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function getAverageScore(definition: TestDefinition, gradeId: number, subject: string): number {
  const gradePrefix = gradeId === 7 ? 'first' : gradeId === 6 ? 'second' : 'third'
  const averageKey = `${gradePrefix}_avg_${subject}` as keyof TestDefinition
  const value = definition[averageKey]
  return value === null ? 0 : Number(value) || 0
}

const TestScoresManagement = () => {
  const searchParams = useSearchParams()
  const [studentName, setStudentName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scores, setScores] = useState<TestScore[]>([])
  const [testDefinitions, setTestDefinitions] = useState<{ [key: number]: TestDefinition }>({})
  const [formTestDefinitions, setFormTestDefinitions] = useState<TestDefinition[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [isValidAccess, setIsValidAccess] = useState(false)
  const [showRadarChart, setShowRadarChart] = useState<{ [key: number]: boolean }>({}) // 追加
  const [currentScore, setCurrentScore] = useState<Partial<TestScore>>({
    test_name: '',
    japanese_score: null,
    math_score: null,
    english_score: null,
    science_score: null,
    social_score: null,
    class_rank: null,
    total_score: null,
  })

  // showToast関数を追加
  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({
      show: true,
      message,
      type,
    })
    setTimeout(() => setNotification(null), 3000)
  }

  // toggleRadarChart関数を追加
  const toggleRadarChart = (scoreId: number) => {
    setShowRadarChart(prev => ({
      ...prev,
      [scoreId]: !prev[scoreId]
    }))
  }
// スコア更新のコールバック関数
const handleScoreUpdate = (subjectKey: string, newScore: number | null) => {
  setScores(prevScores => 
    prevScores.map(score => {
      if (score.test_definition_id === testDefinitions[score.test_definition_id]?.id) {
        const updatedScore = {
          ...score,
          [subjectKey]: newScore
        }
        
        // 合計点の再計算
        const subjects = ['japanese_score', 'math_score', 'english_score', 'science_score', 'social_score']
        const validScores = subjects.filter(subject => {
          const s = updatedScore[subject as keyof TestScore]
          return typeof s === 'number' && s > 0
        })
        
        if (validScores.length === 5) {
          updatedScore.total_score = subjects.reduce((sum, subject) => {
            const s = updatedScore[subject as keyof TestScore] as number
            return sum + (s || 0)
          }, 0)
        } else {
          updatedScore.total_score = null
        }
        
        return updatedScore
      }
      return score
    })
  )
}

// 順位更新のコールバック関数
const handleRankUpdate = (testDefinitionId: number) => (newRank: number | null) => {
  setScores(prevScores => 
    prevScores.map(score => 
      score.test_definition_id === testDefinitionId
        ? { ...score, class_rank: newRank }
        : score
    )
  )
}

  useEffect(() => {
    const validateAndInitialize = async () => {
      try {
        const name = searchParams.get('student')
        const student_id = searchParams.get('student_id')
        const api_key = searchParams.get('api_key')
        const school_id = searchParams.get('school_id')
        const grade_id = searchParams.get('grade_id')
  
        if (!name || !student_id || !api_key || !school_id || !grade_id) {
          throw new Error('必要なパラメータが不足しています')
        }
  
        // APIキーの検証
        const validationRes = await fetch(
          `https://mikawayatsuhashi.sakura.ne.jp/verify_api_key.php?api_key=${api_key}`
        )
        const validationData = await validationRes.json()
        
        if (!validationData.valid) {
          throw new Error('無効なAPIキーです')
        }
  
        setIsValidAccess(true)
        setStudentName(decodeURIComponent(name))
  
        // スコア一覧を取得
        const scoresRes = await fetch(
          `https://mikawayatsuhashi.sakura.ne.jp/y_get_student_test_scores.php?student_id=${student_id}&api_key=${api_key}`
        )
        if (!scoresRes.ok) {
          throw new Error('テストスコアの取得に失敗しました')
        }
        const scoresData = await scoresRes.json()
        if (!scoresData.success) {
          throw new Error(scoresData.error || 'テストスコアの取得に失敗しました')
        }
  
        setScores(scoresData.scores)
  
        // テスト定義を取得（表示用と編集用の両方）
        const allDefsRes = await fetch(
          `https://mikawayatsuhashi.sakura.ne.jp/get_test_definitions.php?${new URLSearchParams({
            student_id,
            school_id,
            api_key,
          }).toString()}`
        )
        if (!allDefsRes.ok) {
          throw new Error('テスト定義の取得に失敗しました')
        }
        const allDefsData = await allDefsRes.json()
        if (!allDefsData.success) {
          throw new Error(allDefsData.error || 'テスト定義の取得に失敗しました')
        }
  
        // 全テスト定義をマップに変換（表示用）
        const defsMap = allDefsData.definitions.reduce(
          (acc: { [key: number]: TestDefinition }, def: TestDefinition) => {
            acc[def.id] = def
            return acc
          },
          {} as { [key: number]: TestDefinition }
        )
        setTestDefinitions(defsMap)
        
        // 入力フォーム用のテスト定義をフィルタリング
        const currentGradeId = parseInt(grade_id);
        const currentYear = new Date().getFullYear();
        
        // 現在の学年のテストと前年度の前学年のテストをフィルタリング
        let formDefs = allDefsData.definitions.filter((def: TestDefinition) => {
          // テスト名から年度を抽出
          const yearMatch = def.test_name.match(/(\d{4})年度/);
          const testYear = yearMatch ? parseInt(yearMatch[1]) : 0;
          
          // 現在の年度のテストで現在の学年のもの
          const isCurrentYearCurrentGrade = (testYear === currentYear && def.grade_id === currentGradeId);
          
          // 前年度のテストで前学年のもの(3年生なら2年生、2年生なら1年生のテスト)
          const previousGradeId = currentGradeId < 7 ? currentGradeId + 1 : 0;
          const isPreviousYearPreviousGrade = (testYear === currentYear - 1 && def.grade_id === previousGradeId);
          
          return isCurrentYearCurrentGrade || isPreviousYearPreviousGrade;
        });
        
        // 現在の年度のテスト定義がなければ、前年度のテスト定義をコピーして年度を更新
        if (!formDefs.some((def: TestDefinition) => def.test_name.includes(`${currentYear}年度`))) {
          // 前年度の同じ学年のテスト定義を検索
          const previousYearDefs = allDefsData.definitions.filter((def: TestDefinition) => {
            const yearMatch = def.test_name.match(/(\d{4})年度/);
            const testYear = yearMatch ? parseInt(yearMatch[1]) : 0;
            return testYear === currentYear - 1 && def.grade_id === currentGradeId;
          });
          
          // 前年度のテスト定義をベースに新年度のテスト定義を作成
          if (previousYearDefs.length > 0) {
            const newYearDefs = previousYearDefs.map((def: TestDefinition) => {
              // 新しいIDを作成（仮のID、実際のDBには保存されていない）
              const newId = -def.id; // 負の値にして既存のIDと衝突しないようにする
              
              // 新しいオブジェクトを作成
              const newDef = {...def, id: newId};
              
              // テスト名の年度を更新
              newDef.test_name = def.test_name.replace(/\d{4}年度/, `${currentYear}年度`);
              
              // 日付を1年後に更新
              const oldDate = new Date(def.scheduled_date);
              const newDate = new Date(oldDate);
              newDate.setFullYear(oldDate.getFullYear() + 1);
              newDef.scheduled_date = newDate.toISOString().split('T')[0];
              
              // 仮表示フラグを設定
              newDef.provisional = true;
              
              return newDef;
            });
            
            // 仮のテスト定義を追加
            formDefs = [...formDefs, ...newYearDefs];
          }
        }
        
        // 年度と日付でソート
        formDefs.sort((a: TestDefinition, b: TestDefinition) => {
          // 年度を抽出
          const yearMatchA = a.test_name.match(/(\d{4})年度/);
          const yearMatchB = b.test_name.match(/(\d{4})年度/);
          const yearA = yearMatchA ? parseInt(yearMatchA[1]) : 0;
          const yearB = yearMatchB ? parseInt(yearMatchB[1]) : 0;
          
          // 年度が異なる場合は新しい年度を先に
          if (yearA !== yearB) {
            return yearB - yearA;
          }
          
          // 同じ年度内では日付の新しいものを先に
          return new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime();
        });
        
        setFormTestDefinitions(formDefs);
        setError(null);
  
      } catch (error) {
        console.error('Error in initialization:', error)
        setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
        setIsValidAccess(false)
      } finally {
        setLoading(false)
      }
    }
  
    validateAndInitialize()
  }, [searchParams])

  const fetchTestScores = async () => {
    try {
      const student_id = searchParams.get('student_id')
      const api_key = searchParams.get('api_key')

      if (!student_id || !api_key) {
        throw new Error('必要なパラメータが不足しています')
      }

      const response = await fetch(
        `https://mikawayatsuhashi.sakura.ne.jp/y_get_student_test_scores.php?student_id=${student_id}&api_key=${api_key}`
      )
      
      if (!response.ok) {
        throw new Error('テストスコアの取得に失敗しました')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'テストスコアの取得に失敗しました')
      }

      setScores(data.scores)
      setError(null)
    } catch (error) {
      console.error('Error fetching scores:', error)
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
    }
  }

  const handleInputChange = (field: keyof TestScore, value: string | number) => {
    setCurrentScore(prev => {
      if (!prev) return prev
      
      const newScore = { ...prev }

      if (field === 'test_name') {
        const selectedTestName = String(value)
        newScore.test_name = selectedTestName

        // テスト定義を取得
        const selectedDef = formTestDefinitions.find(def => def.test_name === selectedTestName);
        
        if (selectedDef) {
          // もし仮のテスト定義なら、実際にはまだDBに存在しないので処理を中断
          if (selectedDef.provisional) {
            return {
              test_name: selectedTestName,
              test_definition_id: selectedDef.id,
              japanese_score: null,
              math_score: null,
              english_score: null,
              science_score: null,
              social_score: null,
              class_rank: null,
              total_score: null,
            };
          }
          
          // IDを設定
          newScore.test_definition_id = selectedDef.id;
          
          // 既存のスコアを探す
          const existingScore = scores.find(score => score.test_definition_id === selectedDef.id)
          if (existingScore) {
            return {
              ...existingScore,
              test_name: selectedTestName,
            }
          }
        }

        return {
          test_name: selectedTestName,
          test_definition_id: selectedDef ? selectedDef.id : 0,
          japanese_score: null,
          math_score: null,
          english_score: null,
          science_score: null,
          social_score: null,
          class_rank: null,
          total_score: null,
        }
      }

      if (field in newScore) {
        if (typeof value === 'string' && value.trim() === '') {
          newScore[field as ScoreField] = null
        } else {
          const numValue = typeof value === 'string' ? Number(value) : value
          if (!Number.isNaN(numValue)) {
            if (field === 'class_rank') {
              newScore.class_rank = numValue > 0 ? numValue : null
            } else if (
              field === 'japanese_score' || 
              field === 'math_score' || 
              field === 'english_score' || 
              field === 'science_score' || 
              field === 'social_score'
            ) {
              newScore[field] = (numValue >= 0 && numValue <= 100) ? numValue : null
            }
          }
        }
      }

      const subjects = [
        'japanese_score', 
        'math_score', 
        'english_score', 
        'science_score', 
        'social_score',
      ] as const

      const validScores = subjects
        .filter(subject => {
          const s = newScore[subject]
          return (
            typeof s === 'number' &&
            !Number.isNaN(s) &&
            s >= 0 &&
            s <= 100
          )
        })
        .map(subject => ({
          field: subject,
          score: newScore[subject] as number
        }))

      newScore.total_score = validScores.length === subjects.length
        ? validScores.reduce((sum, item) => sum + item.score, 0)
        : null

      return newScore
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
  
    try {
      const student_id = searchParams.get('student_id')
      const api_key = searchParams.get('api_key')
  
      if (!student_id || !api_key || !currentScore.test_name) {
        throw new Error('必要なパラメータが不足しています')
      }
      
      // 選択されたテスト定義を探す
      const selectedDef = formTestDefinitions.find(
        def => def.test_name === currentScore.test_name
      );
  
      if (!selectedDef) {
        throw new Error('テスト定義が見つかりません')
      }
      
      // 仮のテスト定義（まだDBにない）の場合はエラー
      if (selectedDef.provisional) {
        throw new Error('このテストはまだ準備中です。管理者にお問い合わせください。')
      }
  
      const formData = new FormData()
      formData.append('student_id', student_id)
      formData.append('api_key', api_key)
      formData.append('test_definition_id', selectedDef.id.toString())
  
      const subjects = [
        'japanese_score',
        'math_score',
        'english_score',
        'science_score',
        'social_score',
      ] as const
  
      const validScores = subjects
        .filter(subject => {
          const s = currentScore[subject]
          return (
            typeof s === 'number' &&
            !Number.isNaN(s) &&
            s >= 0 &&
            s <= 100
          )
        })
        .map(subject => ({
          field: subject,
          score: currentScore[subject] as number,
        }))
  
      validScores.forEach(({ field, score }) => {
        formData.append(field, score.toString())
      })
  
      if (validScores.length === subjects.length) {
        const totalScore = validScores.reduce((sum, { score }) => sum + score, 0)
        formData.append('total_score', totalScore.toString())
      }
  
      if (currentScore.class_rank != null && currentScore.class_rank > 0) {
        formData.append('class_rank', currentScore.class_rank.toString())
      }
  
      const response = await fetch(
        'https://mikawayatsuhashi.sakura.ne.jp/y_save_test_scores.php',
        {
          method: 'POST',
          body: formData,
        }
      )
  
      const responseText = await response.text()
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`)
      }
  
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        console.error('JSONパースエラー:', e)
        throw new Error('サーバーからの応答が不正です')
      }
  
      if (!responseData.success) {
        throw new Error(responseData.error || 'スコアの保存に失敗しました')
      }
  
      await fetchTestScores()
      setNotification({
        show: true,
        message: '点数を保存しました！',
        type: 'success',
      })
  
      setTimeout(() => setNotification(null), 3000)
  
      setCurrentScore({
        test_name: '',
        japanese_score: null,
        math_score: null,
        english_score: null,
        science_score: null,
        social_score: null,
        class_rank: null,
        total_score: null,
      })
  
    } catch (error) {
      console.error('エラーの詳細:', error)
      setNotification({
        show: true,
        message: `保存に失敗しました: ${
          error instanceof Error ? error.message : '予期せぬエラー'
        }`,
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="w-8 h-8 animate-spin text-[#4AC0B9]" />
      </div>
    )
  }

  if (!isValidAccess || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">アクセスエラー</h2>
            <p className="text-gray-600 mb-6">{error || 'アクセスが拒否されました'}</p>
            <button
              onClick={() => window.location.href = 'https://mikawayatsuhashi.sakura.ne.jp/classmate_index.php'}
              className="w-full bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 
                transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              トップページへ戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && notification.show && (
        <div 
          className={`
            fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50
            transition-all duration-300 transform translate-y-0
            ${notification.type === 'success' 
              ? 'bg-green-100 border-l-4 border-green-500 text-green-700' 
              : 'bg-red-100 border-l-4 border-red-500 text-red-700'
            }
          `}
        >
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <FaCheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <FaExclamationCircle className="w-5 h-5 mr-2" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold flex items-center gap-3">
              <span className="text-2xl" style={{ color: '#4AC0B9' }}>
                {studentName}
              </span>
              <span className="text-gray-600">
                {showHistory ? 'の成績履歴' : 'の自己入力フォーム'}
              </span>
            </h1>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-[#4AC0B9] text-white rounded-lg hover:bg-[#3DA8A2] 
                transition-colors duration-200 flex items-center gap-2 shadow-sm"
            >
              <FaHistory className="w-4 h-4" />
              <span>{showHistory ? '入力フォームを表示' : '履歴を表示'}</span>
            </button>
          </div>

          {!showHistory ? (
            <ScoreForm
              currentScore={currentScore}
              testDefinitions={formTestDefinitions}
              existingScores={scores}
              onSubmit={handleSubmit}
              onInputChange={handleInputChange}
              isSaving={saving}
            />
      ) : (
            <div className="space-y-8">
              {/* 編集可能履歴の説明 */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      🖱️ <strong>点数や順位をクリックすると直接編集できます！</strong><br/>
                      間違いを見つけたら、該当する箇所をクリックして修正してください。
                    </p>
                  </div>
                </div>
              </div>

              {/* 実力値表示コンポーネントを追加 */}
              <AbilityIndicator
                allScores={scores}
                studentName={studentName}
              />

              {scores.length > 0 ? (
                scores.map((score, idx) => {
                  const definition = testDefinitions[score.test_definition_id]
                  if (!definition) return null
                  
                  const previousScore = scores[idx + 1]
                  const previousDefinition = previousScore 
                    ? testDefinitions[previousScore.test_definition_id]
                    : null
                  
                  // 表示する学年IDはテスト定義の学年IDを使用
                  const gradeId = definition.grade_id
                  const dateText = formatDate(definition.scheduled_date)
                  const studentId = parseInt(searchParams.get('student_id') || '0')

                  // レーダーチャート用のデータを準備
                  const averageScores = {
                    japanese: getAverageScore(definition, gradeId, 'japanese'),
                    math: getAverageScore(definition, gradeId, 'math'),
                    english: getAverageScore(definition, gradeId, 'english'),
                    science: getAverageScore(definition, gradeId, 'science'),
                    social: getAverageScore(definition, gradeId, 'social')
                  }

                  return (
                    <div
                      key={score.id}
                      className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-[#4AC0B9]">
                          {score.test_name}（{dateText}）
                        </h3>
                        
                        {/* レーダーチャート表示切り替えボタン */}
                        <button
                          onClick={() => toggleRadarChart(score.id || 0)}
                          className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 
                            transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                        >
                          <FaChartLine className="w-3 h-3" />
                          <span>
                            {showRadarChart[score.id || 0] ? 'チャートを隠す' : 'チャートを表示'}
                          </span>
                        </button>
                      </div>

                      {/* レーダーチャート（表示切り替え可能） */}
                      {showRadarChart[score.id || 0] && (
                        <div className="mb-6">
                          <SubjectRadarChart
                            currentScore={{
                              japanese_score: score.japanese_score,
                              math_score: score.math_score,
                              english_score: score.english_score,
                              science_score: score.science_score,
                              social_score: score.social_score
                            }}
                            averageScores={averageScores}
                            previousScore={previousScore ? {
                              japanese_score: previousScore.japanese_score,
                              math_score: previousScore.math_score,
                              english_score: previousScore.english_score,
                              science_score: previousScore.science_score,
                              social_score: previousScore.social_score
                            } : undefined}
                            title={`${score.test_name} - 教科別成績分析`}
                            height={350}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <EditableScoreCard
                          subject="国語"
                          subjectKey="japanese_score"
                          score={score.japanese_score}
                          average={getAverageScore(definition, gradeId, 'japanese')}
                          previousScore={previousScore?.japanese_score ?? null}
                          previousDiffFromAvg={
                            previousScore && previousDefinition
                              ? (previousScore.japanese_score ?? 0) - 
                                getAverageScore(previousDefinition, previousDefinition.grade_id, 'japanese')
                              : undefined
                          }
                          testId={score.test_definition_id}
                          studentId={studentId}
                          onScoreUpdate={handleScoreUpdate}
                          showToast={showToast}
                        />
                        <EditableScoreCard
                          subject="数学"
                          subjectKey="math_score"
                          score={score.math_score}
                          average={getAverageScore(definition, gradeId, 'math')}
                          previousScore={previousScore?.math_score ?? null}
                          previousDiffFromAvg={
                            previousScore && previousDefinition
                              ? (previousScore.math_score ?? 0) - 
                                getAverageScore(previousDefinition, previousDefinition.grade_id, 'math')
                              : undefined
                          }
                          testId={score.test_definition_id}
                          studentId={studentId}
                          onScoreUpdate={handleScoreUpdate}
                          showToast={showToast}
                        />
                        <EditableScoreCard
                          subject="英語"
                          subjectKey="english_score"
                          score={score.english_score}
                          average={getAverageScore(definition, gradeId, 'english')}
                          previousScore={previousScore?.english_score ?? null}
                          previousDiffFromAvg={
                            previousScore && previousDefinition
                              ? (previousScore.english_score ?? 0) - 
                                getAverageScore(previousDefinition, previousDefinition.grade_id, 'english')
                              : undefined
                          }
                          testId={score.test_definition_id}
                          studentId={studentId}
                          onScoreUpdate={handleScoreUpdate}
                          showToast={showToast}
                        />
                        <EditableScoreCard
                          subject="理科"
                          subjectKey="science_score"
                          score={score.science_score}
                          average={getAverageScore(definition, gradeId, 'science')}
                          previousScore={previousScore?.science_score ?? null}
                          previousDiffFromAvg={
                            previousScore && previousDefinition
                              ? (previousScore.science_score ?? 0) - 
                                getAverageScore(previousDefinition, previousDefinition.grade_id, 'science')
                              : undefined
                          }
                          testId={score.test_definition_id}
                          studentId={studentId}
                          onScoreUpdate={handleScoreUpdate}
                          showToast={showToast}
                        />
                        <EditableScoreCard
                          subject="社会"
                          subjectKey="social_score"
                          score={score.social_score}
                          average={getAverageScore(definition, gradeId, 'social')}
                          previousScore={previousScore?.social_score ?? null}
                          previousDiffFromAvg={
                            previousScore && previousDefinition
                              ? (previousScore.social_score ?? 0) - 
                                getAverageScore(previousDefinition, previousDefinition.grade_id, 'social')
                              : undefined
                          }
                          testId={score.test_definition_id}
                          studentId={studentId}
                          onScoreUpdate={handleScoreUpdate}
                          showToast={showToast}
                        />
                      </div>

                      <EditableTotalScoreCard
                        score={score.total_score}
                        previousScore={previousScore?.total_score}
                        rank={score.class_rank}
                        previousRank={previousScore?.class_rank}
                        testId={score.test_definition_id}
                        studentId={studentId}
                        onRankUpdate={handleRankUpdate(score.test_definition_id)}
                        showToast={showToast}
                      />
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  テストの記録がありません
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestScoresManagement;