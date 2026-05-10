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

    @Value("${anthropic.api.key:}")
    private String claudeApiKey;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private static final String CLAUDE_MODEL = "claude-haiku-4-5-20251001";
    private static final String ANTHROPIC_VERSION = "2023-06-01";
    private static final String GEMINI_MODEL = "gemini-flash-latest";

    public ClaudeService() {
        this.webClient = WebClient.builder().build();
    }

    public String chat(String systemPrompt, String userPrompt, int maxTokens) {
        boolean claudeConfigured = claudeApiKey != null && !claudeApiKey.isBlank()
                && !claudeApiKey.equals("YOUR_CLAUDE_API_KEY_HERE");

        if (claudeConfigured) {
            try {
                return callClaude(systemPrompt, userPrompt, maxTokens);
            } catch (Exception e) {
                log.warn("Claude API failed ({}), falling back to Gemini", e.getMessage());
            }
        }

        boolean geminiConfigured = geminiApiKey != null && !geminiApiKey.isBlank()
                && !geminiApiKey.equals("YOUR_GEMINI_API_KEY_HERE");

        if (geminiConfigured) {
            try {
                return callGemini(systemPrompt, userPrompt);
            } catch (Exception e) {
                log.error("Gemini API also failed: {}", e.getMessage());
            }
        }

        log.error("No AI provider available. Set anthropic.api.key or gemini.api.key in application.properties");
        throw new RuntimeException("No AI provider configured");
    }

    @SuppressWarnings("unchecked")
    private String callClaude(String systemPrompt, String userPrompt, int maxTokens) {
        Map<String, Object> body = Map.of(
                "model", CLAUDE_MODEL,
                "max_tokens", maxTokens,
                "system", systemPrompt,
                "messages", List.of(Map.of("role", "user", "content", userPrompt))
        );

        Map<String, Object> response = webClient.post()
                .uri("https://api.anthropic.com/v1/messages")
                .header("x-api-key", claudeApiKey)
                .header("anthropic-version", ANTHROPIC_VERSION)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue((Object) body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
        return (String) content.get(0).get("text");
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String systemPrompt, String userPrompt) {
        String fullPrompt = systemPrompt + "\n\n" + userPrompt;

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", fullPrompt)))
                )
        );

        Map<String, Object> response = webClient.post()
                .uri("https://generativelanguage.googleapis.com/v1beta/models/"
                        + GEMINI_MODEL + ":generateContent?key=" + geminiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue((Object) body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        return (String) parts.get(0).get("text");
    }
}
