class RealtimeAPITools {
  async search_web(query: string): Promise<Response> {
    const url = 'https://api.dify.ai/v1/workflows/run'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: { query: query },
        response_mode: 'blocking',
        user: 'abc-123',
      }),
    })
    console.log(response)

    const data = await response.json()
    return data.data.outputs.text
  }

  async get_current_weather(
    latitude: number,
    longitude: number,
    timezone: string,
    location: string
  ): Promise<string> {
    console.log(
      `Getting weather for ${location} (${latitude}, ${longitude}), timezone: ${timezone}`
    )

    // Open-Meteo APIにリクエストを送信
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&timezone=${encodeURIComponent(timezone)}`
    const response = await fetch(url)
    const data = await response.json()

    console.log(data)

    // 最初の値を取得
    const temperature = data.hourly.temperature_2m[0]
    const weathercode = data.hourly.weathercode[0]

    // 天気コードを天気状況に変換
    const weatherStatus = this.getWeatherStatus(weathercode)

    return `天気情報: ${location}の現在の気温は${temperature}°C、天気は${weatherStatus}です。`
  }

  // 天気コードを天気状況に変換するヘルパー関数
  private getWeatherStatus(code: number): string {
    // 天気コードに応じて適切な天気状況を返す
    if (code === 0) return '快晴'
    if ([1, 2, 3].includes(code)) return '晴れ'
    if (code >= 51 && code <= 55) return '霧雨'
    if (code >= 61 && code <= 65) return '雨'
    if (code === 80) return 'にわか雨'
    // その他の天気コードに対応
    if (code === 45) return '霧'
    if (code >= 71 && code <= 75) return '雪'
    return '不明'
  }

  async add_task(description: string): Promise<string> {
    if (typeof window === 'undefined') {
      console.error('サーバーサイドでは実行できません。')
      return 'タスクの登録に失敗しました'
    }

    const urlParams = new URLSearchParams(window.location.search)
    const responseChannelId = urlParams.get('channel_id')
    const responseThreadId = urlParams.get('thread_id')

    if (!responseChannelId || !responseThreadId) {
      console.error('URL に channel_id または thread_id が含まれていません。')
      return 'タスクの登録に失敗しました'
    }

    try {
      const response = await fetch('/api/add_task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          response_channel_id: responseChannelId,
          response_thread_id: responseThreadId,
        }),
      })

      if (!response.ok) {
        throw new Error('APIリクエストが失敗しました')
      }

      const data = await response.json()
      return data.message
    } catch (error) {
      console.error('タスク登録中にエラーが発生しました:', error)
      return 'タスクの登録に失敗しました'
    }
  }

  // Add other functions here
}

const realtimeAPITools = new RealtimeAPITools()
export default realtimeAPITools
