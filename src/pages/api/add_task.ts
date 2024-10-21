import type { NextApiRequest, NextApiResponse } from 'next'

const SLACKGPTS_API_BASE = process.env.NEXT_PUBLIC_SLACKGPTS_API_BASE
const SLACKGPTS_API_KEY = process.env.NEXT_PUBLIC_SLACKGPTS_API_KEY

async function addTaskToSlackGPTs(taskData: {
  description: string
  response_channel_id: string
  response_thread_id: string
}) {
  const response = await fetch(`${SLACKGPTS_API_BASE}/api/v1/tasks`, {
    method: 'POST',
    headers: {
      ...(SLACKGPTS_API_KEY ? { 'x-api-key': SLACKGPTS_API_KEY } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  })

  if (!response.ok) {
    throw new Error('SlackGPTs APIリクエストが失敗しました')
  }

  return response.json()
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { description, response_channel_id, response_thread_id } = req.body

    if (!description || !response_channel_id || !response_thread_id) {
      return res
        .status(400)
        .json({ message: '必要なパラメータが不足しています' })
    }

    await addTaskToSlackGPTs({
      description,
      response_channel_id,
      response_thread_id,
    })
    res.status(200).json({ message: 'タスクを登録しました' })
  } catch (error) {
    console.error('タスク登録中にエラーが発生しました:', error)
    res.status(500).json({ message: 'タスクの登録に失敗しました' })
  }
}
