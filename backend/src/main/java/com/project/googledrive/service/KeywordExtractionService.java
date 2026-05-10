package com.project.googledrive.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeywordExtractionService {

    private final ClaudeService claudeService;

    public List<String> extractKeywords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new ArrayList<>();
        }

        try {
            String textForKeywords = text.length() > 3000 ? text.substring(0, 3000) : text;

            String prompt = "Extract 5-7 main keywords or topics from this text. " +
                    "Return ONLY the keywords separated by commas, nothing else. " +
                    "Keywords should be single words or short phrases (2-3 words max). " +
                    "Text: " + textForKeywords;

            String response = claudeService.chat(
                    "You are a keyword extraction expert. Return only keywords separated by commas.",
                    prompt,
                    100
            );

            List<String> keywords = Arrays.stream(response.split(","))
                    .map(String::trim)
                    .map(k -> k.replaceAll("[\"']", ""))
                    .filter(k -> !k.isEmpty())
                    .limit(7)
                    .collect(Collectors.toList());

            log.info("Extracted keywords for document: {}", keywords);
            return keywords;

        } catch (Exception e) {
            log.error("Keyword extraction failed: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
}
