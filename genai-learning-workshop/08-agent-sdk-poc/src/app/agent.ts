import { HARNESS_PROMPT } from "./config.js";
import Openai from 'openai';

export interface IMessage {
    role: 'user' | 'assistant' | 'developer';
    content: string
}

export interface ITool {
    name: string
    description: string
    doc?: string
    executor: (input: string) => Promise<string>
}

export type Interceptor = (message: IMessage) => void

export class AgentBuilder {
    public instructions: string | undefined
    public toolList: ITool[]

    constructor() {
        this.toolList = []
    }

    public setIntructions(instructions: string) {
        this.instructions = instructions
        return this
    }

    public tool(t: ITool) {
        this.toolList.push(t)
        return this
    }



    public build() {
        return new Agent(this)
    }
}



export class Agent {
    private instructions: string
    private messageHistory: IMessage[]
    private toolMap: Map<string, ITool>
    private openai: Openai

    private interceptors: Interceptor[]


    private MAX_LOOP = 30

    constructor(builder: AgentBuilder) {
        this.toolMap = new Map();
        this.openai = new Openai({
            apiKey: ''
        })
        this.interceptors = []

        for (const t of builder.toolList) {
            this.toolMap.set(t.name, t)
        }

        this.instructions = `
            ${HARNESS_PROMPT}\n\n

            System Prompt:
            ${builder.instructions}

            Available Tools:
            ${builder.toolList.map(t => JSON.stringify({ functionName: t.name, functionDescription: t.description, functionDoc: t.doc })).join('\n')}

        `
        this.messageHistory = []
    }

    public attachInterceptor(interceptor: Interceptor) {
        this.interceptors.push(interceptor)
    }

    private notifyInterceptors(message: IMessage) {
        for (const interceptor of this.interceptors) {
            interceptor(message)
        }
    }

    static builder() {
        return new AgentBuilder()
    }

    public printSystemPrompt() {
        console.log(this.instructions)
    }

    public async run(query: string) {
        // Append Query to Message HISTORY
        this.messageHistory.push({ role: 'user', content: query })

        for (let i = 0; i < this.MAX_LOOP; i++) {
            // .. LLMResponse = Call LLM (SYSTEM PROMT + MESSAGE HISTORY)
            const llmResponse = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: this.instructions },
                    ...this.messageHistory.map(e => ({ role: e.role, content: e.content }))
                ]
            })

            const rawLLMResponse: string = llmResponse.choices[0]?.message.content as string

            // Append LLMResponse to Message HISTORY
            this.messageHistory.push({ role: 'assistant', content: rawLLMResponse })
            this.notifyInterceptors({ role: 'assistant', content: rawLLMResponse })

            // Parse the Raw LLM Response to JSON Object
            const parsedReult = JSON.parse(rawLLMResponse)

            // if LLMResponse.step === "OUTPUT" break (Stop Condition)
            if (parsedReult.step.toLowerCase() === "output") return this.messageHistory

            // if LLMResponse.step === "TOOL_REQUEST" 
            /**
             *     tool =  ToolMap . find ( LLMResponse.functionName )
             *     toolResult = tool.executor(LLMResponse.input)
             *     Append toolResult to Message HISTORY
             *      continue
             */
            if (parsedReult.step.toLowerCase() === "tool_request") {
                const { functionName, input } = parsedReult
                const tool = this.toolMap.get(functionName)

                if (!tool) {
                    this.messageHistory.push({ role: 'developer', content: `Error: Function with name ${functionName} does not exists` })
                    continue
                }

                const toolResult = await tool.executor(input)
                this.messageHistory.push({
                    role: 'developer', content: JSON.stringify({
                        functionName,
                        input,
                        toolResult
                    })
                })
                this.notifyInterceptors({
                    role: 'developer', content: JSON.stringify({
                        functionName,
                        input,
                        toolResult
                    })
                })

            }
        }
    }
}

