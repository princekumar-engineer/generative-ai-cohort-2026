import { Agent, AgentBuilder } from './app/agent.js'
import type { ITool } from './app/agent.js'
import axios from 'axios'

import { exec } from 'child_process';

const weatherTool: ITool = {
    name: 'fetchWeatherInfo',
    description: 'Fetches realtime weather data by cityname',
    doc: 'fetchWeatherInfo(cityName: string): WeatherReport',
    async executor(cityName) {
        const url = `https://wttr.in/${cityName.toLowerCase()}?format=%C+%t`;
        const response = await axios.get(url, { responseType: 'text' });
        return JSON.stringify({ cityName, weatherInfo: response.data });
    },
}

const cliAccessTool: ITool = {
    name: 'execCli',
    description: 'Runs a CLI command on users machine and returns output',
    doc: 'execCli(cli: string): CLIResponse',
    executor(cmd) {
        return new Promise((res, rej) => {
            exec(cmd, (err, out) => {
                if (err) return res(`There was an Error ${err}`);
                else return res(out);
            });
        });
    }
}

async function init() {
    const agent: Agent = Agent.builder()
        .setIntructions(`You are an expert coding agent`)
        .tool(cliAccessTool)
        .build()

    const weatherAgent: Agent = Agent.builder()
        .setIntructions(`You are an expert weather agent`)
        .tool(weatherTool)
        .build()

    const xyzAgent: Agent = Agent.builder()
        .setIntructions(`You are an expert weather agent`)
        .tool(weatherTool)
        .build()


    agent.attachInterceptor(message => console.log(`Message: ${message.role}: ${message.content}`))

    const result = await agent.run('can you build a simple hello world program in c++ on my current project as hello.cpp')
    console.log(result![result?.length! - 1])
}

init()