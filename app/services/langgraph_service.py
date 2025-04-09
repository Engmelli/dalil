from langchain_openai.chat_models import ChatOpenAI
from typing import List, Callable, Any
from langgraph.graph import StateGraph, START
from langgraph.graph import MessagesState
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import tools_condition, ToolNode

def chatbot(sysMessage: str, tools: List[Callable[..., Any]]):
    llm = ChatOpenAI(model="gpt-4o")
    llm_with_tools = llm.bind_tools(tools)

    sysMessage = SystemMessage(content=sysMessage)
 
    def assistant(state: MessagesState):
        return {"messages": [llm_with_tools.invoke([sysMessage] + state["messages"])]}


    builder = StateGraph(MessagesState)
    builder.add_node("assistant", assistant)
    builder.add_node("tools", ToolNode(tools))

    builder.add_edge(START, "assistant")
    builder.add_conditional_edges("assistant", tools_condition,)
    builder.add_edge("tools", "assistant")

    graph = builder.compile()
    return graph