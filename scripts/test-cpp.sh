set -e
g++ -std=c++17 -O2 -Wall -Wextra -Icpp/include cpp/test/test.cpp -o /tmp/tarjan_test && /tmp/tarjan_test
