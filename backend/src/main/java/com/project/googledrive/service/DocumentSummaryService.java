package com.project.googledrive.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentSummaryService {

    private final ClaudeService claudeService;

    public String generateSummary(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }

        try {
            String textForSummary = text.length() > 4000 ? text.substring(0, 4000) : text;

            String prompt = "Summarize this document in 2-3 concise sentences. " +
                    "Focus on the main topic and key points. " +
                    "Be specific and informative. " +
                    "Text: " + textForSummary;

            String summary = claudeService.chat(
                    "You are a document summarization expert. Provide clear, concise summaries.",
                    prompt,
                    150
            );

            log.info("Generated summary ({} chars)", summary.length());
            return summary;

        } catch (Exception e) {
            log.error("Summary generation failed: {}", e.getMessage());
            return "";
        }
    }
}
