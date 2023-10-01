*** Settings ***
Library           OperatingSystem
Library           Collections
Library           String
Library           BuiltIn
Library           SeleniumLibrary
Library           Telnet
Library           RequestsLibrary
Library           XML
Library           Process

Suite Setup       Parse HTML Content


*** Variables ***
${yaml_file}    ../xpath.yaml
@{xpath_list}    ${EMPTY}

*** Keywords ***
Parse HTML Content
    ${html_content} =    Get HTML Content From URL    https://exam.msrit.edu/
    ${parsed_html}=    Evaluate    bs4.BeautifulSoup('''${html_content}''', 'html.parser')
    Set Suite Variable    ${parsed_html}

Get HTML Content From URL
    [Arguments]    ${url}
    ${response} =    Get    ${url}
    Should Be Equal As Strings    ${response.status_code}    200    # Check if the request was successful (HTTP status code 200)
    ${html_content} =    Convert To String    ${response.content}
    [Return]    ${html_content}

Create XPath List
    [Arguments]    ${xpath_input}
    ${xpath_list} =    Evaluate    [x.strip() for x in "${xpath_input}".splitlines() if x.strip()]
    [Return]    ${xpath_list}

Check XPath Expressions
    [Arguments]    @{xpath_list}    ${parsed_html}
    ${valid_xpaths} =    Create List
    ${invalid_xpaths} =  Create List
    
    ${xpath}  Set Variable    /html/body/div/div/div/div/div/table/tbody/tr[10]/td/div/form/table/tbody/tr[1]/td[3]
    # FOR    ${xpath}    IN    @{xpath_list}
        # Log To Console    ${xpath}
        ${matching_elements} =    Evaluate    ${parsed_html}.xpath('${xpath}')
        ${is_valid} =    Run Keyword And Return Status    Should Not Be Empty    ${matching_elements}

        Run Keyword If    ${is_valid}
        ...    Append To List    ${valid_xpaths}    ${xpath}
        ...    ELSE
        ...    Append To List    ${invalid_xpaths}    ${xpath}
    # END

    [Return]    ${valid_xpaths}    ${invalid_xpaths}

Log Valid and Invalid XPath Expressions
    [Arguments]    ${valid_xpaths}    ${invalid_xpaths}
    ${valid_count} =    Get Length    @{valid_xpaths}
    ${invalid_count} =    Get Length    @{invalid_xpaths}

    Log To Console    \nValid XPath Expressions:
    FOR    ${xpath}    IN    @{valid_xpaths}
            Log To Console    - ${xpath}
    END

    Log To Console    \nInvalid XPath Expressions:
    FOR    ${xpath}    IN    @{invalid_xpaths}
            Log To Console    - ${xpath}
    END
    Log To Console    \nTotal Valid XPath Expressions: ${valid_count}
    Log To Console    Total Invalid XPath Expressions: ${invalid_count}

# Get From File
#     [Arguments]    ${file_path}
#     ${file_content} =    Get File    ${file_path}
#     [Return]    ${file_content}

# Read XPath Expressions From TXT
#     [Arguments]    ${yaml_file}
#     ${xpath_list} =    Get From File    ${yaml_file}
#     [Return]    ${xpath_list}

*** Keywords ***
Read XPath Expressions From TXT
    [Arguments]    ${txt_file}
    @{xpath_list}    Create List
    ...    /html/body/div/div/div/div/div/table/tbody/tr[10]/td/div/form/table/tbody/tr[1]/td[3]
    ...    /html/body/div/div/div/div/div/table/tbody/tr[10]/td/div/form/table/tbody/tr[1]/td[3]
    # ${file_contents}=    Get File    ${txt_file}
    # ${xpath_lines}=    Split To Lines    ${file_contents}
    # FOR    ${line}    IN    @{xpath_lines}
    #     Append To List    ${xpath_list}    ${line}
    # END
    [Return]    @{xpath_list}


*** Test Cases ***
Display XPath Expressions Test
    # ${xpath_input} =        Read XPath Expressions From TXT    xpath.txt
    # ${xpath_list} =    Create XPath List    ${xpath_input}
    @{xpath_list}=    Create List
    ...   /html/body/div/div/div/div/div/table/tbody/tr[10]/td/div/form/table/tbody/tr[1]/td[3]
    ...   /html/body/div/div/div/div/div/table/tbody/tr[10]/td/div/form/table/tbody/tr[1]/td[3]
    ${valid_xpaths}    ${invalid_xpaths} =    Check XPath Expressions    xpath_list=@{xpath_list}    parsed_html=${parsed_html}
    Log Valid and Invalid XPath Expressions    ${valid_xpaths}    ${invalid_xpaths}
