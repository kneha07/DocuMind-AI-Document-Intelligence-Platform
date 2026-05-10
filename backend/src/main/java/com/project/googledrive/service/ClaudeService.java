package com.project.googledrive.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ClaudeService {

    private final WebClient webClient;

    @Value("${anthropic.api.key}")
    private String apiKey;

    private static final String CLAUDE_MODEL = "claude-haiku-4-5-20251001";
    private static final String ANTHROPIC_VERSION = "2023-06-01";

    public ClaudeService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.anthropic.com")
                .build();
    }

    @SuppressWarnings({"null", "unchecked"})
    public String chat(String systemPrompt, String userPrompt, int maxTokens) {
        Map<String, Object> body = Map.of(
                "model", CLAUDE_MODEL,
                "max_tokens", maxTokens,
                "system", systemPrompt,
                "messages", List.of(Map.of("role", "user", "content", userPrompt))
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> response = webClient.post()
                .uri("/v1/messages")
                .header("x-api-key", apiKey)
                .header("anthropic-version", ANTHROPIC_VERSION)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue((Object) body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
        return (String) content.get(0).get("text");
    }
}
