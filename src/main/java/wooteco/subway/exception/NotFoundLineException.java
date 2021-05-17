package wooteco.subway.exception;

public class NotFoundLineException extends SubwayException {

    private static final String NOT_FOUND_LINE_ERROR_MESSAGE = "해당 노선을 찾을 수 없습니다.";

    public NotFoundLineException() {
        super(NOT_FOUND_LINE_ERROR_MESSAGE);
    }
}
